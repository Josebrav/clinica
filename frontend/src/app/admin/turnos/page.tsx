'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  asignarTurno,
  crearTurno,
  eliminarTurno,
  getDoctoresAdmin,
  getTurnosAdmin,
  liberarTurno,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Doctor, Turno } from '@/lib/types';

const emptyTurnoForm = { fecha: '', horaInicio: '' };
const emptyAsignarForm = { pacienteNombre: '', pacienteTelefono: '', notas: '' };

export default function AdminTurnosPage() {
  const { token, role, doctorId: propioDoctorId, nombreCompleto } = useAuth();
  const esMedico = role === 'MEDICO';

  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState<string>('');
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [turnoForm, setTurnoForm] = useState(emptyTurnoForm);
  const [savingTurno, setSavingTurno] = useState(false);
  const [turnoFormError, setTurnoFormError] = useState<string | null>(null);

  const [asignandoId, setAsignandoId] = useState<string | null>(null);
  const [asignarForm, setAsignarForm] = useState(emptyAsignarForm);
  const [asignarError, setAsignarError] = useState<string | null>(null);
  const [savingAsignar, setSavingAsignar] = useState(false);

  useEffect(() => {
    if (!token) return;
    if (esMedico) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- el médico opera siempre sobre su propio id
      setDoctorId(propioDoctorId ?? '');
      return;
    }
    getDoctoresAdmin(token)
      .then((data) => {
        setDoctores(data);
        if (data.length > 0) setDoctorId(data[0].id);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar médicos'),
      );
  }, [token, esMedico, propioDoctorId]);

  async function cargarTurnos() {
    if (!token || !doctorId) {
      setTurnos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getTurnosAdmin(token, { doctorId });
      setTurnos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar turnos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/dependency-change
    cargarTurnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, doctorId]);

  async function handleCrearTurno(e: FormEvent) {
    e.preventDefault();
    if (!token || !doctorId) return;
    setSavingTurno(true);
    setTurnoFormError(null);
    try {
      await crearTurno({ doctorId, ...turnoForm }, token);
      setTurnoForm(emptyTurnoForm);
      await cargarTurnos();
    } catch (err) {
      setTurnoFormError(
        err instanceof Error ? err.message : 'Error al crear el turno',
      );
    } finally {
      setSavingTurno(false);
    }
  }

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
      await cargarTurnos();
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
      await cargarTurnos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al liberar el turno');
    }
  }

  async function handleEliminar(turno: Turno) {
    if (!token) return;
    if (!confirm('¿Eliminar este horario?')) return;
    try {
      await eliminarTurno(turno.id, token);
      await cargarTurnos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el turno');
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Turnos</h1>

      {esMedico ? (
        <p className="mb-6 text-sm text-gray-600">
          Mostrando los turnos de <strong>{nombreCompleto}</strong>.
        </p>
      ) : (
        <>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Médico
          </label>
          <select
            className="mb-6 w-full max-w-sm rounded-md border px-3 py-2"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            {doctores.length === 0 && (
              <option value="">Sin médicos cargados</option>
            )}
            {doctores.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.nombre} {doctor.apellido} — {doctor.especialidad}
              </option>
            ))}
          </select>
        </>
      )}

      {doctorId && (
        <form
          onSubmit={handleCrearTurno}
          className="mb-8 grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              required
              className="w-full rounded-md border px-3 py-2"
              value={turnoForm.fecha}
              onChange={(e) =>
                setTurnoForm((f) => ({ ...f, fecha: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Hora
            </label>
            <input
              type="time"
              required
              className="w-full rounded-md border px-3 py-2"
              value={turnoForm.horaInicio}
              onChange={(e) =>
                setTurnoForm((f) => ({ ...f, horaInicio: e.target.value }))
              }
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingTurno}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
            >
              {savingTurno ? 'Agregando...' : 'Agregar horario'}
            </button>
          </div>
          {turnoFormError && (
            <p className="col-span-full text-sm text-red-600">
              {turnoFormError}
            </p>
          )}
        </form>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : turnos.length === 0 ? (
        <p className="text-gray-500">Este médico todavía no tiene horarios cargados.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Paciente</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((turno) => (
                <tr key={turno.id} className="border-t">
                  <td className="px-4 py-3">{turno.fecha}</td>
                  <td className="px-4 py-3">{turno.horaInicio}</td>
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
                    <div className="flex justify-end gap-2">
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
                      <button
                        onClick={() => handleEliminar(turno)}
                        className="rounded-md border px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
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
