export interface Doctor {
  id: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  fotoUrl: string | null;
  descripcion: string | null;
  activo: boolean;
  username?: string | null;
}

export type EstadoTurno = 'DISPONIBLE' | 'RESERVADO';

export interface Turno {
  id: string;
  doctorId: string;
  doctor?: Doctor;
  fecha: string;
  horaInicio: string;
  estado: EstadoTurno;
  pacienteNombre: string | null;
  pacienteTelefono: string | null;
  notas: string | null;
}

export type Role = 'SECRETARIA' | 'MEDICO' | 'JEFA';

export type TipoMovimiento = 'INGRESO' | 'EGRESO';

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  concepto: string;
  fecha: string;
  creadoPor: string | null;
  createdAt: string;
}

export interface StatsResumen {
  doctores: { total: number; activos: number };
  turnos: { total: number; disponibles: number; reservados: number };
  turnosPorMedico: {
    doctorId: string;
    nombre: string;
    total: number;
    reservados: number;
  }[];
  finanzas: {
    ingresosTotal: number;
    egresosTotal: number;
    balanceTotal: number;
    ingresosMes: number;
    egresosMes: number;
    balanceMes: number;
  };
}
