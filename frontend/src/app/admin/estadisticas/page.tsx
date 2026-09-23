'use client';

import {
  Activity,
  CalendarCheck,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStatsResumen } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatMonto } from '@/lib/format';
import type { StatsResumen } from '@/lib/types';

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function AdminEstadisticasPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/token-change
    setLoading(true);
    getStatsResumen(token)
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas'),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="text-gray-500">Cargando...</p>;
  }

  if (error || !stats) {
    return <p className="text-sm text-red-600">{error ?? 'Sin datos'}</p>;
  }

  const maxTurnos = Math.max(1, ...stats.turnosPorMedico.map((d) => d.total));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Turnos por médico, ocupación y resumen financiero.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Stethoscope size={20} />}
          label="Médicos activos"
          value={`${stats.doctores.activos} / ${stats.doctores.total}`}
          accent="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={<CalendarCheck size={20} />}
          label="Turnos reservados"
          value={`${stats.turnos.reservados} / ${stats.turnos.total}`}
          accent="bg-teal-50 text-teal-700"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Ingresos del mes"
          value={formatMonto(stats.finanzas.ingresosMes)}
          accent="bg-green-50 text-green-700"
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          label="Egresos del mes"
          value={formatMonto(stats.finanzas.egresosMes)}
          accent="bg-red-50 text-red-700"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <Activity size={18} className="text-blue-700" />
            Turnos por médico
          </h2>
          {stats.turnosPorMedico.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no hay turnos cargados.</p>
          ) : (
            <div className="space-y-4">
              {stats.turnosPorMedico.map((d) => (
                <div key={d.doctorId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{d.nombre}</span>
                    <span className="text-gray-500">
                      {d.reservados} reservados / {d.total} totales
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500"
                      style={{ width: `${(d.total / maxTurnos) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <Wallet size={18} className="text-blue-700" />
            Balance general
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Ingresos totales</dt>
              <dd className="font-medium text-green-700">
                {formatMonto(stats.finanzas.ingresosTotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Egresos totales</dt>
              <dd className="font-medium text-red-700">
                {formatMonto(stats.finanzas.egresosTotal)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <dt className="font-semibold text-gray-900">Balance</dt>
              <dd
                className={`font-semibold ${stats.finanzas.balanceTotal < 0 ? 'text-red-600' : 'text-gray-900'}`}
              >
                {formatMonto(stats.finanzas.balanceTotal)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
