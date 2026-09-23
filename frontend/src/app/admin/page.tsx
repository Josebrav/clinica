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

export default function AdminHomePage() {
  const { role, nombreCompleto, username } = useAuth();

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
      </div>
    </div>
  );
}
