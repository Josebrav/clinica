'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  asignarTurno,
  crearPlantilla,
  crearTurno,
  eliminarPlantilla,
  eliminarTurno,
  getDoctoresAdmin,
  getPlantillas,
  getTurnosAdmin,
  liberarTurno,
  repetirPlantilla,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Doctor, PlantillaTurno, Turno } from '@/lib/types';

const emptyTurnoForm = { fecha: '', horaInicio: '' };
const emptyAsignarForm = { pacienteNombre: '', pacienteTelefono: '', notas: '' };
const emptyPlantillaForm = {
  fecha: '',
  horaInicio: '',
  horaFin: '',
  intervaloMinutos: 20,
};
const OPCIONES_INTERVALO = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

function formatearFechaCorta(fecha: string) {
  const [, m, d] = fecha.split('-');
  return `${d}/${m}`;
}

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

  const [plantillas, setPlantillas] = useState<PlantillaTurno[]>([]);
  const [plantillaForm, setPlantillaForm] = useState(emptyPlantillaForm);
  const [savingPlantilla, setSavingPlantilla] = useState(false);
  const [plantillaFormError, setPlantillaFormError] = useState<string | null>(
    null,
  );
  const [procesandoPlantillaId, setProcesandoPlantillaId] = useState<
    string | null
  >(null);

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

  async function cargarPlantillas() {
    if (!token || !doctorId) {
      setPlantillas([]);
      return;
    }
    try {
      const data = await getPlantillas(token, doctorId);
      setPlantillas(data);
    } catch {
      // silencioso: no es crítico si falla, se puede reintentar
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/dependency-change
    cargarTurnos();
    cargarPlantillas();
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

  async function handleCrearPlantilla(e: FormEvent) {
    e.preventDefault();
    if (!token || !doctorId) return;
    setSavingPlantilla(true);
    setPlantillaFormError(null);
    try {
      await crearPlantilla({ doctorId, ...plantillaForm }, token);
      setPlantillaForm(emptyPlantillaForm);
      await Promise.all([cargarTurnos(), cargarPlantillas()]);
    } catch (err) {
      setPlantillaFormError(
        err instanceof Error ? err.message : 'Error al generar los turnos',
      );
    } finally {
      setSavingPlantilla(false);
    }
  }

  async function handleRepetirPlantilla(plantilla: PlantillaTurno) {
    if (!token) return;
    setProcesandoPlantillaId(plantilla.id);
    try {
      await repetirPlantilla(plantilla.id, token);
      await Promise.all([cargarTurnos(), cargarPlantillas()]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al repetir el bloque');
    } finally {
      setProcesandoPlantillaId(null);
    }
  }

  async function handleEliminarPlantilla(plantilla: PlantillaTurno) {
    if (!token) return;
    if (
      !confirm(
        '¿Eliminar este bloque recurrente? No borra los turnos ya generados, solo deja de poder repetirlo.',
      )
    ) {
      return;
    }
    try {
      await eliminarPlantilla(plantilla.id, token);
      await cargarPlantillas();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el bloque');
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
      <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Cargar horarios disponibles y asignar turnos a pacientes.
      </p>

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
              min={new Date().toISOString().slice(0, 10)}
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

      {doctorId && (
        <div className="mb-8 rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Cargar turnos por rango
          </h2>
          <form
            onSubmit={handleCrearPlantilla}
            className="grid grid-cols-1 gap-3 sm:grid-cols-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Fecha de inicio
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-md border px-3 py-2"
                value={plantillaForm.fecha}
                onChange={(e) =>
                  setPlantillaForm((f) => ({ ...f, fecha: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Hora inicio
              </label>
              <input
                type="time"
                required
                className="w-full rounded-md border px-3 py-2"
                value={plantillaForm.horaInicio}
                onChange={(e) =>
                  setPlantillaForm((f) => ({
                    ...f,
                    horaInicio: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Hora fin
              </label>
              <input
                type="time"
                required
                className="w-full rounded-md border px-3 py-2"
                value={plantillaForm.horaFin}
                onChange={(e) =>
                  setPlantillaForm((f) => ({ ...f, horaFin: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Intervalo
              </label>
              <select
                className="w-full rounded-md border px-3 py-2"
                value={plantillaForm.intervaloMinutos}
                onChange={(e) =>
                  setPlantillaForm((f) => ({
                    ...f,
                    intervaloMinutos: Number(e.target.value),
                  }))
                }
              >
                {OPCIONES_INTERVALO.map((min) => (
                  <option key={min} value={min}>
                    {min} min
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-full">
              <button
                type="submit"
                disabled={savingPlantilla}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                {savingPlantilla ? 'Generando...' : 'Generar turnos'}
              </button>
            </div>
            {plantillaFormError && (
              <p className="col-span-full text-sm text-red-600">
                {plantillaFormError}
              </p>
            )}
          </form>

          {plantillas.length > 0 && (
            <div className="mt-4 divide-y border-t">
              {plantillas.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {p.horaInicio} - {p.horaFin} cada {p.intervaloMinutos}{' '}
                      min
                    </p>
                    <p className="text-gray-500">
                      Último: {formatearFechaCorta(p.ultimaFechaGenerada)} ·
                      Próximo: {formatearFechaCorta(p.proximaFecha)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRepetirPlantilla(p)}
                      disabled={
                        !p.puedeRepetir || procesandoPlantillaId === p.id
                      }
                      title={
                        !p.puedeRepetir
                          ? `Disponible desde ${formatearFechaCorta(p.proximaFecha)}`
                          : undefined
                      }
                      className="rounded-md border border-blue-600 px-3 py-1.5 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                    >
                      {procesandoPlantillaId === p.id
                        ? 'Repitiendo...'
                        : p.puedeRepetir
                          ? 'Repetir'
                          : `Disponible desde ${formatearFechaCorta(p.proximaFecha)}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminarPlantilla(p)}
                      className="rounded-md border border-red-600 px-3 py-1.5 text-red-600 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              Teléfono (opcional)
            </label>
            <input
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
