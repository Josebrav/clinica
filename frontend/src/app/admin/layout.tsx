'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';

const RUTAS_SOLO_JEFA = ['/admin/finanzas', '/admin/estadisticas'];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <span className="text-lg font-semibold text-blue-700">
              {tituloPanel}
            </span>
            <nav className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
              <Link href="/admin" className="hover:text-blue-700">
                Inicio
              </Link>
              {role !== 'MEDICO' && (
                <Link href="/admin/medicos" className="hover:text-blue-700">
                  Médicos
                </Link>
              )}
              <Link href="/admin/turnos" className="hover:text-blue-700">
                Turnos
              </Link>
              {role === 'JEFA' && (
                <>
                  <Link href="/admin/finanzas" className="hover:text-blue-700">
                    Finanzas
                  </Link>
                  <Link href="/admin/estadisticas" className="hover:text-blue-700">
                    Estadísticas
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{nombreCompleto ?? username}</span>
            <button
              onClick={() => {
                logout();
                router.push('/admin/login');
              }}
              className="rounded-md border px-3 py-1.5 hover:bg-gray-100"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
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
