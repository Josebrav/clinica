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

@Injectable()
export class TurnosService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic(doctorId?: string) {
    return this.prisma.turno.findMany({
      where: {
        estado: EstadoTurno.DISPONIBLE,
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
}
