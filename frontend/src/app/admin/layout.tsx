'use client';

import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import type { Role } from '@/lib/types';

const RUTAS_SOLO_JEFA = ['/admin/finanzas', '/admin/estadisticas'];

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: Role[];
}[] = [
  {
    href: '/admin',
    label: 'Inicio',
    icon: LayoutDashboard,
    roles: ['SECRETARIA', 'MEDICO', 'JEFA'],
  },
  {
    href: '/admin/medicos',
    label: 'Médicos',
    icon: Stethoscope,
    roles: ['SECRETARIA', 'JEFA'],
  },
  {
    href: '/admin/turnos',
    label: 'Turnos',
    icon: CalendarClock,
    roles: ['SECRETARIA', 'MEDICO', 'JEFA'],
  },
  {
    href: '/admin/agenda',
    label: 'Agenda del día',
    icon: CalendarDays,
    roles: ['SECRETARIA', 'MEDICO', 'JEFA'],
  },
  {
    href: '/admin/finanzas',
    label: 'Finanzas',
    icon: Wallet,
    roles: ['JEFA'],
  },
  {
    href: '/admin/estadisticas',
    label: 'Estadísticas',
    icon: BarChart3,
    roles: ['JEFA'],
  },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { token, username, role, nombreCompleto, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const sinPermiso =
    (role === 'MEDICO' && pathname === '/admin/medicos') ||
    (role !== 'JEFA' && RUTAS_SOLO_JEFA.includes(pathname));

  useEffect(() => {
    if (!loading && !token && !isLoginPage) {
      router.replace('/admin/login');
    } else if (!loading && sinPermiso) {
      router.replace('/admin');
    }
  }, [loading, token, isLoginPage, sinPermiso, router]);

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando...</div>;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!token || sinPermiso) {
    return null;
  }

  const tituloPanel =
    role === 'JEFA' ? 'Panel' : role === 'MEDICO' ? 'Panel Médico' : 'Panel Secretaría';

  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  function handleLogout() {
    logout();
    router.push('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-white md:flex">
        <div className="flex items-center gap-2 border-b px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 text-white">
            <Stethoscope size={18} />
          </span>
          <span className="font-semibold text-gray-900">{tituloPanel}</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-4 py-4">
          <p className="truncate text-sm font-medium text-gray-900">
            {nombreCompleto ?? username}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 text-white">
              <Stethoscope size={16} />
            </span>
            <span className="font-semibold text-gray-900">{tituloPanel}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Salir
          </button>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b bg-white px-3 py-2 md:hidden">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
