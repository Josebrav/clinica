'use client';

import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { asignarTurno, getTurnosAdmin, liberarTurno } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Turno } from '@/lib/types';

const emptyAsignarForm = { pacienteNombre: '', pacienteTelefono: '', notas: '' };

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function sumarDias(fecha: string, dias: number) {
  const [y, m, d] = fecha.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + dias);
  return date.toISOString().slice(0, 10);
}

function formatearFecha(fecha: string) {
  const [y, m, d] = fecha.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

export default function AdminAgendaPage() {
  const { token } = useAuth();
  const [fecha, setFecha] = useState(hoy());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [asignandoId, setAsignandoId] = useState<string | null>(null);
  const [asignarForm, setAsignarForm] = useState(emptyAsignarForm);
  const [asignarError, setAsignarError] = useState<string | null>(null);
  const [savingAsignar, setSavingAsignar] = useState(false);

  async function cargar() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTurnosAdmin(token, { fecha });
      setTurnos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/fecha-change
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, fecha]);

  function abrirAsignar(turno: Turno) {
    setAsignandoId(turno.id);
    setAsignarForm(emptyAsignarForm);
    setAsignarError(null);
  }

  async function handleAsignar(e: FormEvent) {
    e.preventDefault();
    if (!token || !asignandoId) return;
    setSavingAsignar(true);
    setAsignarError(null);
    try {
      await asignarTurno(asignandoId, asignarForm, token);
      setAsignandoId(null);
      await cargar();
    } catch (err) {
      setAsignarError(
        err instanceof Error ? err.message : 'Error al asignar el turno',
      );
    } finally {
      setSavingAsignar(false);
    }
  }

  async function handleLiberar(turno: Turno) {
    if (!token) return;
    if (!confirm('¿Liberar este turno y quitar los datos del paciente?')) return;
    try {
      await liberarTurno(turno.id, token);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al liberar el turno');
    }
  }

  const reservados = turnos.filter((t) => t.estado === 'RESERVADO').length;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Agenda del día</h1>
      <p className="mb-6 text-sm text-gray-500">
        Quién tiene turno, con hora y paciente.
      </p>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFecha((f) => sumarDias(f, -1))}
            className="rounded-lg border p-2 text-gray-500 hover:bg-gray-50"
            aria-label="Día anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <input
            type="date"
            className="rounded-lg border px-3 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <button
            onClick={() => setFecha((f) => sumarDias(f, 1))}
            className="rounded-lg border p-2 text-gray-500 hover:bg-gray-50"
            aria-label="Día siguiente"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setFecha(hoy())}
            className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Hoy
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 capitalize">
          <CalendarDays size={16} className="text-blue-700" />
          {formatearFecha(fecha)}
          <span className="ml-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {reservados} reservado{reservados === 1 ? '' : 's'} / {turnos.length}
          </span>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : turnos.length === 0 ? (
        <p className="rounded-xl border bg-white p-6 text-center text-gray-500">
          No hay turnos cargados para este día.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Médico</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((turno) => (
                <tr key={turno.id} className="border-t">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 font-medium text-gray-900">
                      <Clock size={14} className="text-gray-400" />
                      {turno.horaInicio}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {turno.doctor
                      ? `${turno.doctor.nombre} ${turno.doctor.apellido}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        turno.estado === 'DISPONIBLE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {turno.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {turno.pacienteNombre ? (
                      <div>
                        <p className="font-medium">{turno.pacienteNombre}</p>
                        <p className="text-xs text-gray-500">
                          {turno.pacienteTelefono}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {turno.estado === 'DISPONIBLE' ? (
                      <button
                        onClick={() => abrirAsignar(turno)}
                        className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                      >
                        Asignar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLiberar(turno)}
                        className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                      >
                        Liberar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {asignandoId && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={handleAsignar}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-lg font-bold">Asignar turno</h2>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre del paciente
            </label>
            <input
              required
              className="mb-3 w-full rounded-md border px-3 py-2"
              value={asignarForm.pacienteNombre}
              onChange={(e) =>
                setAsignarForm((f) => ({
                  ...f,
                  pacienteNombre: e.target.value,
                }))
              }
            />

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              required
              className="mb-3 w-full rounded-md border px-3 py-2"
              value={asignarForm.pacienteTelefono}
              onChange={(e) =>
                setAsignarForm((f) => ({
                  ...f,
                  pacienteTelefono: e.target.value,
                }))
              }
            />

            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notas (opcional)
            </label>
            <textarea
              className="mb-3 w-full rounded-md border px-3 py-2"
              rows={2}
              value={asignarForm.notas}
              onChange={(e) =>
                setAsignarForm((f) => ({ ...f, notas: e.target.value }))
              }
            />

            {asignarError && (
              <p className="mb-3 text-sm text-red-600">{asignarError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAsignandoId(null)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingAsignar}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                {savingAsignar ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
