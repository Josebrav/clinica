'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  actualizarDoctor,
  crearDoctor,
  eliminarDoctor,
  getDoctoresAdmin,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DoctorPhoto } from '@/components/DoctorPhoto';
import type { Doctor } from '@/lib/types';

const emptyForm = {
  nombre: '',
  apellido: '',
  especialidad: '',
  descripcion: '',
  activo: true,
  username: '',
  password: '',
};

export default function AdminMedicosPage() {
  const { token } = useAuth();
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [foto, setFoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function cargarDoctores() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getDoctoresAdmin(token);
      setDoctores(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar médicos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/token-change
    cargarDoctores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function abrirNuevo() {
    setEditingId(null);
    setForm(emptyForm);
    setFoto(null);
    setFormError(null);
    setShowForm(true);
  }

  function abrirEdicion(doctor: Doctor) {
    setEditingId(doctor.id);
    setForm({
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      especialidad: doctor.especialidad,
      descripcion: doctor.descripcion ?? '',
      activo: doctor.activo,
      username: doctor.username ?? '',
      password: '',
    });
    setFoto(null);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('apellido', form.apellido);
    formData.append('especialidad', form.especialidad);
    formData.append('descripcion', form.descripcion);
    formData.append('activo', String(form.activo));
    formData.append('username', form.username);
    if (form.password) formData.append('password', form.password);
    if (foto) formData.append('foto', foto);

    try {
      if (editingId) {
        await actualizarDoctor(editingId, formData, token);
      } else {
        await crearDoctor(formData, token);
      }
      setShowForm(false);
      await cargarDoctores();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Error al guardar el médico',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(doctor: Doctor) {
    if (!token) return;
    if (
      !confirm(
        `¿Eliminar a ${doctor.nombre} ${doctor.apellido}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    try {
      await eliminarDoctor(doctor.id, token);
      await cargarDoctores();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médicos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Agregar, editar o dar de baja médicos.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          + Agregar médico
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : doctores.length === 0 ? (
        <p className="text-gray-500">No hay médicos cargados todavía.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {doctores.map((doctor) => (
            <div
              key={doctor.id}
              className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <DoctorPhoto doctor={doctor} className="h-40 w-full" />
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">
                    {doctor.nombre} {doctor.apellido}
                  </h2>
                  {!doctor.activo && (
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-700">{doctor.especialidad}</p>
                {doctor.username && (
                  <p className="mt-1 text-xs text-gray-400">
                    usuario: {doctor.username}
                  </p>
                )}
              </div>
              <div className="flex border-t">
                <button
                  onClick={() => abrirEdicion(doctor)}
                  className="flex-1 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(doctor)}
                  className="flex-1 border-l py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-lg font-bold">
              {editingId ? 'Editar médico' : 'Nuevo médico'}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  required
                  className="w-full rounded-md border px-3 py-2"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  required
                  className="w-full rounded-md border px-3 py-2"
                  value={form.apellido}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apellido: e.target.value }))
                  }
                />
              </div>
            </div>

            <label className="mt-3 mb-1 block text-sm font-medium text-gray-700">
              Especialidad
            </label>
            <input
              required
              className="w-full rounded-md border px-3 py-2"
              value={form.especialidad}
              onChange={(e) =>
                setForm((f) => ({ ...f, especialidad: e.target.value }))
              }
            />

            <label className="mt-3 mb-1 block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              rows={3}
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value }))
              }
            />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Usuario de acceso
                </label>
                <input
                  required
                  className="w-full rounded-md border px-3 py-2"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contraseña {editingId ? '(dejar vacío para no cambiarla)' : ''}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  minLength={6}
                  className="w-full rounded-md border px-3 py-2"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Con este usuario y contraseña el médico va a poder entrar a su
              propio panel de turnos en {'"'}Acceso secretaría{'"'}.
            </p>

            <label className="mt-3 mb-1 block text-sm font-medium text-gray-700">
              Foto {editingId ? '(dejar vacío para no cambiarla)' : ''}
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            />

            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, activo: e.target.checked }))
                }
              />
              Visible en la web pública
            </label>

            {formError && (
              <p className="mt-3 text-sm text-red-600">{formError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
