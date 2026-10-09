import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoTurno } from '@prisma/client';
import type { AuthUser } from '../auth/role';
import { PrismaService } from '../prisma/prisma.service';
import { AsignarTurnoDto } from './dto/asignar-turno.dto';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { CreateTurnoDto } from './dto/create-turno.dto';

const doctorSelectSeguro = {
  id: true,
  nombre: true,
  apellido: true,
  especialidad: true,
  fotoUrl: true,
  descripcion: true,
  activo: true,
} as const;

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function sumarDiasISO(fecha: string, dias: number) {
  const [y, m, d] = fecha.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + dias);
  return date.toISOString().slice(0, 10);
}

function generarHorarios(
  horaInicio: string,
  horaFin: string,
  intervaloMinutos: number,
): string[] {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const finMinutos = h2 * 60 + m2;
  const horarios: string[] = [];
  for (
    let actual = h1 * 60 + m1;
    actual < finMinutos;
    actual += intervaloMinutos
  ) {
    const hh = String(Math.floor(actual / 60)).padStart(2, '0');
    const mm = String(actual % 60).padStart(2, '0');
    horarios.push(`${hh}:${mm}`);
  }
  return horarios;
}

@Injectable()
export class TurnosService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic(doctorId?: string) {
    return this.prisma.turno.findMany({
      where: {
        estado: EstadoTurno.DISPONIBLE,
        fecha: { gte: hoyISO() },
        ...(doctorId ? { doctorId } : {}),
      },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
      include: { doctor: { select: doctorSelectSeguro } },
    });
  }

  findAllForAdmin(
    requester: AuthUser,
    doctorId?: string,
    estado?: EstadoTurno,
    fecha?: string,
  ) {
    const doctorIdFiltro =
      requester.role === 'MEDICO' ? requester.doctorId : doctorId;

    return this.prisma.turno.findMany({
      where: {
        ...(doctorIdFiltro ? { doctorId: doctorIdFiltro } : {}),
        ...(estado ? { estado } : {}),
        ...(fecha ? { fecha } : {}),
      },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
      include: { doctor: { select: doctorSelectSeguro } },
    });
  }

  async create(dto: CreateTurnoDto, requester: AuthUser) {
    const doctorId =
      requester.role === 'MEDICO'
        ? (requester.doctorId as string)
        : dto.doctorId;

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }

    if (dto.fecha < hoyISO()) {
      throw new BadRequestException(
        'No se puede cargar un horario con una fecha que ya pasó',
      );
    }

    return this.prisma.turno.create({
      data: { ...dto, doctorId },
    });
  }

  private async findOneOrThrow(id: string) {
    const turno = await this.prisma.turno.findUnique({ where: { id } });
    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }
    return turno;
  }

  private assertPuedeOperar(turnoDoctorId: string, requester: AuthUser) {
    if (requester.role === 'MEDICO' && requester.doctorId !== turnoDoctorId) {
      throw new ForbiddenException(
        'No podés operar sobre turnos de otro médico',
      );
    }
  }

  async asignar(id: string, dto: AsignarTurnoDto, requester: AuthUser) {
    const turno = await this.findOneOrThrow(id);
    this.assertPuedeOperar(turno.doctorId, requester);
    if (turno.estado === EstadoTurno.RESERVADO) {
      throw new BadRequestException('El turno ya está reservado');
    }
    return this.prisma.turno.update({
      where: { id },
      data: { ...dto, estado: EstadoTurno.RESERVADO },
    });
  }

  async liberar(id: string, requester: AuthUser) {
    const turno = await this.findOneOrThrow(id);
    this.assertPuedeOperar(turno.doctorId, requester);
    return this.prisma.turno.update({
      where: { id },
      data: {
        estado: EstadoTurno.DISPONIBLE,
        pacienteNombre: null,
        pacienteTelefono: null,
        notas: null,
      },
    });
  }

  async remove(id: string, requester: AuthUser) {
    const turno = await this.findOneOrThrow(id);
    this.assertPuedeOperar(turno.doctorId, requester);
    await this.prisma.turno.delete({ where: { id } });
    return { ok: true };
  }

  private async generarTurnosParaFecha(
    doctorId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    intervaloMinutos: number,
  ) {
    const horarios = generarHorarios(horaInicio, horaFin, intervaloMinutos);
    const existentes = await this.prisma.turno.findMany({
      where: { doctorId, fecha, horaInicio: { in: horarios } },
      select: { horaInicio: true },
    });
    const yaExisten = new Set(existentes.map((t) => t.horaInicio));
    const nuevos = horarios.filter((h) => !yaExisten.has(h));

    if (nuevos.length > 0) {
      await this.prisma.turno.createMany({
        data: nuevos.map((horaInicioSlot) => ({
          doctorId,
          fecha,
          horaInicio: horaInicioSlot,
        })),
      });
    }
    return nuevos.length;
  }

  private plantillaConEstado<T extends { ultimaFechaGenerada: string }>(
    plantilla: T,
  ) {
    return {
      ...plantilla,
      puedeRepetir: plantilla.ultimaFechaGenerada < hoyISO(),
      proximaFecha: sumarDiasISO(plantilla.ultimaFechaGenerada, 7),
    };
  }

  async crearPlantilla(dto: CreatePlantillaDto, requester: AuthUser) {
    const doctorId =
      requester.role === 'MEDICO'
        ? (requester.doctorId as string)
        : (dto.doctorId as string);

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }
    if (dto.fecha < hoyISO()) {
      throw new BadRequestException(
        'No se puede cargar un bloque con una fecha que ya pasó',
      );
    }
    if (dto.horaFin <= dto.horaInicio) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }

    const plantilla = await this.prisma.plantillaTurno.create({
      data: {
        doctorId,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        intervaloMinutos: dto.intervaloMinutos,
        ultimaFechaGenerada: dto.fecha,
      },
    });

    await this.generarTurnosParaFecha(
      doctorId,
      dto.fecha,
      dto.horaInicio,
      dto.horaFin,
      dto.intervaloMinutos,
    );

    return this.plantillaConEstado(plantilla);
  }

  async listarPlantillas(requester: AuthUser, doctorId?: string) {
    const doctorIdFiltro =
      requester.role === 'MEDICO' ? requester.doctorId : doctorId;

    const plantillas = await this.prisma.plantillaTurno.findMany({
      where: { ...(doctorIdFiltro ? { doctorId: doctorIdFiltro } : {}) },
      orderBy: { createdAt: 'asc' },
      include: { doctor: { select: doctorSelectSeguro } },
    });

    return plantillas.map((p) => this.plantillaConEstado(p));
  }

  private async findPlantillaOrThrow(id: string) {
    const plantilla = await this.prisma.plantillaTurno.findUnique({
      where: { id },
    });
    if (!plantilla) {
      throw new NotFoundException('Bloque recurrente no encontrado');
    }
    return plantilla;
  }

  async repetirPlantilla(id: string, requester: AuthUser) {
    const plantilla = await this.findPlantillaOrThrow(id);
    this.assertPuedeOperar(plantilla.doctorId, requester);

    let proximaFecha = sumarDiasISO(plantilla.ultimaFechaGenerada, 7);
    while (proximaFecha < hoyISO()) {
      proximaFecha = sumarDiasISO(proximaFecha, 7);
    }

    await this.generarTurnosParaFecha(
      plantilla.doctorId,
      proximaFecha,
      plantilla.horaInicio,
      plantilla.horaFin,
      plantilla.intervaloMinutos,
    );

    const actualizada = await this.prisma.plantillaTurno.update({
      where: { id },
      data: { ultimaFechaGenerada: proximaFecha },
    });

    return this.plantillaConEstado(actualizada);
  }

  async eliminarPlantilla(id: string, requester: AuthUser) {
    const plantilla = await this.findPlantillaOrThrow(id);
    this.assertPuedeOperar(plantilla.doctorId, requester);
    await this.prisma.plantillaTurno.delete({ where: { id } });
    return { ok: true };
  }
}
