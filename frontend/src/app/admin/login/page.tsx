'use client';

import { Lock, Stethoscope, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { siteConfig } from '@/lib/site-config';

export default function AdminLoginPage() {
  const { login, token } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      router.replace('/admin');
    }
  }, [token, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-olive-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-stone-50/95 p-8 shadow-xl backdrop-blur"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-olive-700 text-white">
            <Stethoscope size={24} />
          </span>
          <h1 className="mt-3 text-xl font-bold text-stone-900">
            {siteConfig.nombre}
          </h1>
          <p className="mt-1 text-sm text-stone-500">Ingreso al panel</p>
        </div>

        <label className="mb-1 block text-sm font-medium text-stone-700">
          Usuario
        </label>
        <div className="relative mb-4">
          <User
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
          />
          <input
            className="w-full rounded-lg border border-stone-300 py-2 pr-3 pl-9 focus:border-olive-600 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <label className="mb-1 block text-sm font-medium text-stone-700">
          Contraseña
        </label>
        <div className="relative mb-4">
          <Lock
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400"
          />
          <input
            type="password"
            className="w-full rounded-lg border border-stone-300 py-2 pr-3 pl-9 focus:border-olive-600 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-olive-700 py-2.5 font-semibold text-white shadow-sm transition hover:bg-olive-800 hover:shadow-md disabled:opacity-60"
        >
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
