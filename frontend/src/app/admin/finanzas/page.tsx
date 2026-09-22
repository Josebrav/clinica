'use client';

import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  crearMovimiento,
  eliminarMovimiento,
  getMovimientos,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatMonto } from '@/lib/format';
import type { Movimiento, TipoMovimiento } from '@/lib/types';

const hoy = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  tipo: 'INGRESO' as TipoMovimiento,
  monto: '',
  concepto: '',
  fecha: hoy(),
};

export default function AdminFinanzasPage() {
  const { token } = useAuth();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function cargar() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMovimientos(token);
      setMovimientos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/token-change
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resumen = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((acc, m) => acc + m.monto, 0);
    const egresos = movimientos
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((acc, m) => acc + m.monto, 0);
    return { ingresos, egresos, balance: ingresos - egresos };
  }, [movimientos]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const monto = Number(form.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setFormError('Ingresá un monto válido, mayor a 0.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await crearMovimiento(
        { tipo: form.tipo, monto, concepto: form.concepto, fecha: form.fecha },
        token,
      );
      setForm({ ...emptyForm, fecha: form.fecha });
      await cargar();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Error al guardar el movimiento',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(movimiento: Movimiento) {
    if (!token) return;
    if (!confirm(`¿Eliminar "${movimiento.concepto}"?`)) return;
    try {
      await eliminarMovimiento(movimiento.id, token);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Finanzas</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <ArrowUpCircle size={22} />
          </span>
          <div>
            <p className="text-xs text-gray-500">Ingresos</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatMonto(resumen.ingresos)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ArrowDownCircle size={22} />
          </span>
          <div>
            <p className="text-xs text-gray-500">Egresos</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatMonto(resumen.egresos)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white">
            <Wallet size={22} />
          </span>
          <div>
            <p className="text-xs text-gray-500">Balance</p>
            <p
              className={`text-lg font-semibold ${resumen.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}
            >
              {formatMonto(resumen.balance)}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 sm:grid-cols-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={form.tipo}
            onChange={(e) =>
              setForm((f) => ({ ...f, tipo: e.target.value as TipoMovimiento }))
            }
          >
            <option value="INGRESO">Ingreso</option>
            <option value="EGRESO">Egreso</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Monto
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            className="w-full rounded-md border px-3 py-2"
            value={form.monto}
            onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Concepto
          </label>
          <input
            required
            className="w-full rounded-md border px-3 py-2"
            value={form.concepto}
            onChange={(e) =>
              setForm((f) => ({ ...f, concepto: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            type="date"
            required
            className="w-full rounded-md border px-3 py-2"
            value={form.fecha}
            onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-5">
          {formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Agregar movimiento'}
          </button>
        </div>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : movimientos.length === 0 ? (
        <p className="text-gray-500">Todavía no hay movimientos cargados.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Cargado por</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-4 py-3">{m.fecha}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.tipo === 'INGRESO'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {m.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.concepto}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatMonto(m.monto)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{m.creadoPor ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEliminar(m)}
                      className="rounded-md border px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
