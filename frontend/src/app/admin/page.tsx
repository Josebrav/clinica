'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AdminHomePage() {
  const { role } = useAuth();

  const titulo =
    role === 'JEFA'
      ? 'Panel administrativo'
      : role === 'MEDICO'
        ? 'Mi panel'
        : 'Panel de secretaría';

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{titulo}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {role !== 'MEDICO' && (
          <Link
            href="/admin/medicos"
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
          >
            <h2 className="font-semibold text-blue-700">Médicos</h2>
            <p className="mt-1 text-sm text-gray-600">
              Agregar, editar o dar de baja médicos.
            </p>
          </Link>
        )}
        <Link
          href="/admin/turnos"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="font-semibold text-blue-700">Turnos</h2>
          <p className="mt-1 text-sm text-gray-600">
            {role === 'MEDICO'
              ? 'Cargar tus horarios disponibles y asignar tus turnos a pacientes.'
              : 'Cargar horarios disponibles y asignar turnos a pacientes.'}
          </p>
        </Link>
        {role === 'JEFA' && (
          <>
            <Link
              href="/admin/finanzas"
              className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h2 className="font-semibold text-blue-700">Finanzas</h2>
              <p className="mt-1 text-sm text-gray-600">
                Registrar ingresos y egresos, y ver el balance.
              </p>
            </Link>
            <Link
              href="/admin/estadisticas"
              className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
            >
              <h2 className="font-semibold text-blue-700">Estadísticas</h2>
              <p className="mt-1 text-sm text-gray-600">
                Turnos por médico, ocupación y resumen financiero.
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
