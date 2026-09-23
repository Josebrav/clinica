import type {
  Doctor,
  EstadoTurno,
  Movimiento,
  StatsResumen,
  TipoMovimiento,
  Turno,
} from './types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// --- Público ---

export async function getDoctoresPublic(): Promise<Doctor[]> {
  const res = await fetch(`${API_URL}/doctors`, { cache: 'no-store' });
  return handle(res);
}

export async function getDoctorPublic(id: string): Promise<Doctor> {
  const res = await fetch(`${API_URL}/doctors/${id}`, { cache: 'no-store' });
  return handle(res);
}

export async function getTurnosPublic(doctorId: string): Promise<Turno[]> {
  const res = await fetch(`${API_URL}/turnos?doctorId=${doctorId}`, {
    cache: 'no-store',
  });
  return handle(res);
}

// --- Admin: médicos ---

export async function getDoctoresAdmin(token: string): Promise<Doctor[]> {
  const res = await fetch(`${API_URL}/doctors/admin/all`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handle(res);
}

export async function crearDoctor(
  formData: FormData,
  token: string,
): Promise<Doctor> {
  const res = await fetch(`${API_URL}/doctors`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  return handle(res);
}

export async function actualizarDoctor(
  id: string,
  formData: FormData,
  token: string,
): Promise<Doctor> {
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: formData,
  });
  return handle(res);
}

export async function eliminarDoctor(id: string, token: string) {
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handle(res);
}

// --- Admin: turnos ---

export async function getTurnosAdmin(
  token: string,
  params: { doctorId?: string; estado?: EstadoTurno; fecha?: string } = {},
): Promise<Turno[]> {
  const query = new URLSearchParams();
  if (params.doctorId) query.set('doctorId', params.doctorId);
  if (params.estado) query.set('estado', params.estado);
  if (params.fecha) query.set('fecha', params.fecha);
  const qs = query.toString();
  const res = await fetch(
    `${API_URL}/turnos/admin/all${qs ? `?${qs}` : ''}`,
    { headers: authHeaders(token), cache: 'no-store' },
  );
  return handle(res);
}

export async function crearTurno(
  data: { doctorId: string; fecha: string; horaInicio: string },
  token: string,
): Promise<Turno> {
  const res = await fetch(`${API_URL}/turnos`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function asignarTurno(
  id: string,
  data: { pacienteNombre: string; pacienteTelefono: string; notas?: string },
  token: string,
): Promise<Turno> {
  const res = await fetch(`${API_URL}/turnos/${id}/asignar`, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function liberarTurno(id: string, token: string): Promise<Turno> {
  const res = await fetch(`${API_URL}/turnos/${id}/liberar`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handle(res);
}

export async function eliminarTurno(id: string, token: string) {
  const res = await fetch(`${API_URL}/turnos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handle(res);
}

// --- Jefa: finanzas ---

export async function getMovimientos(token: string): Promise<Movimiento[]> {
  const res = await fetch(`${API_URL}/finanzas/movimientos`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handle(res);
}

export async function crearMovimiento(
  data: { tipo: TipoMovimiento; monto: number; concepto: string; fecha: string },
  token: string,
): Promise<Movimiento> {
  const res = await fetch(`${API_URL}/finanzas/movimientos`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function eliminarMovimiento(id: string, token: string) {
  const res = await fetch(`${API_URL}/finanzas/movimientos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return handle(res);
}

// --- Jefa: estadísticas ---

export async function getStatsResumen(token: string): Promise<StatsResumen> {
  const res = await fetch(`${API_URL}/stats/resumen`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  return handle(res);
}
