import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async resumen() {
    const [doctores, turnos, movimientos] = await Promise.all([
      this.prisma.doctor.findMany(),
      this.prisma.turno.findMany({ include: { doctor: true } }),
      this.prisma.movimiento.findMany(),
    ]);

    const turnosPorMedicoMap = new Map<
      string,
      { doctorId: string; nombre: string; total: number; reservados: number }
    >();

    for (const turno of turnos) {
      const entry = turnosPorMedicoMap.get(turno.doctorId) ?? {
        doctorId: turno.doctorId,
        nombre: `${turno.doctor.nombre} ${turno.doctor.apellido}`,
        total: 0,
        reservados: 0,
      };
      entry.total += 1;
      if (turno.estado === 'RESERVADO') entry.reservados += 1;
      turnosPorMedicoMap.set(turno.doctorId, entry);
    }

    const mesActual = new Date().toISOString().slice(0, 7);
    const movimientosMes = movimientos.filter((m) =>
      m.fecha.startsWith(mesActual),
    );

    const sumar = (lista: typeof movimientos, tipo: 'INGRESO' | 'EGRESO') =>
      lista.filter((m) => m.tipo === tipo).reduce((acc, m) => acc + m.monto, 0);

    const ingresosTotal = sumar(movimientos, 'INGRESO');
    const egresosTotal = sumar(movimientos, 'EGRESO');
    const ingresosMes = sumar(movimientosMes, 'INGRESO');
    const egresosMes = sumar(movimientosMes, 'EGRESO');

    return {
      doctores: {
        total: doctores.length,
        activos: doctores.filter((d) => d.activo).length,
      },
      turnos: {
        total: turnos.length,
        disponibles: turnos.filter((t) => t.estado === 'DISPONIBLE').length,
        reservados: turnos.filter((t) => t.estado === 'RESERVADO').length,
      },
      turnosPorMedico: Array.from(turnosPorMedicoMap.values()).sort(
        (a, b) => b.total - a.total,
      ),
      finanzas: {
        ingresosTotal,
        egresosTotal,
        balanceTotal: ingresosTotal - egresosTotal,
        ingresosMes,
        egresosMes,
        balanceMes: ingresosMes - egresosMes,
      },
    };
  }
}
