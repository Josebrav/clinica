'use client';

import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CalendarDays,
  Stethoscope,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { actualizarInstagram, getDoctorPublic } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function DashboardCard({
  href,
  icon,
  titulo,
  descripcion,
}: {
  href: string;
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white">
        {icon}
      </span>
      <h2 className="mt-4 font-semibold text-gray-900">{titulo}</h2>
      <p className="mt-1 text-sm text-gray-600">{descripcion}</p>
      <span className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-700 transition group-hover:gap-2">
        Ir
        <ArrowRight size={15} />
      </span>
    </Link>
  );
}

function MiInstagramCard({ doctorId, token }: { doctorId: string; token: string }) {
  const [instagramUrl, setInstagramUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDoctorPublic(doctorId)
      .then((doctor) => {
        setInstagramUrl(doctor.instagramUrl ?? '');
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [doctorId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMensaje(null);
    try {
      await actualizarInstagram(doctorId, instagramUrl, token);
      setMensaje('Guardado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-3">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 text-white">
          <FaInstagram size={16} />
        </span>
        <h2 className="font-semibold text-gray-900">Mi Instagram</h2>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Este link aparece como ícono en tu perfil público.
      </p>
      {loading ? (
        <p className="mt-3 text-sm text-gray-400">Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            placeholder="https://instagram.com/usuario"
            className="flex-1 rounded-md border px-3 py-2"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}
      {mensaje && <p className="mt-2 text-sm text-green-700">{mensaje}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function AdminHomePage() {
  const { role, nombreCompleto, username, doctorId, token } = useAuth();

  const titulo =
    role === 'JEFA'
      ? 'Panel administrativo'
      : role === 'MEDICO'
        ? 'Mi panel'
        : 'Panel de secretaría';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Hola, {nombreCompleto ?? username}.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {role !== 'MEDICO' && (
          <DashboardCard
            href="/admin/medicos"
            icon={<Stethoscope size={22} />}
            titulo="Médicos"
            descripcion="Agregar, editar o dar de baja médicos."
          />
        )}
        <DashboardCard
          href="/admin/turnos"
          icon={<CalendarClock size={22} />}
          titulo="Turnos"
          descripcion={
            role === 'MEDICO'
              ? 'Cargar tus horarios disponibles y asignar tus turnos a pacientes.'
              : 'Cargar horarios disponibles y asignar turnos a pacientes.'
          }
        />
        <DashboardCard
          href="/admin/agenda"
          icon={<CalendarDays size={22} />}
          titulo="Agenda del día"
          descripcion="Ver quién tiene turno hoy, con hora y paciente."
        />
        {role === 'JEFA' && (
          <>
            <DashboardCard
              href="/admin/finanzas"
              icon={<Wallet size={22} />}
              titulo="Finanzas"
              descripcion="Registrar ingresos y egresos, y ver el balance."
            />
            <DashboardCard
              href="/admin/estadisticas"
              icon={<BarChart3 size={22} />}
              titulo="Estadísticas"
              descripcion="Turnos por médico, ocupación y resumen financiero."
            />
          </>
        )}
        {role === 'MEDICO' && doctorId && token && (
          <MiInstagramCard doctorId={doctorId} token={token} />
        )}
      </div>
    </div>
  );
}
