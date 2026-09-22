'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-xl font-bold text-gray-900">
          Ingreso 
        </h1>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Usuario
        </label>
        <input
          className="mb-4 w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          className="mb-4 w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
        >
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
