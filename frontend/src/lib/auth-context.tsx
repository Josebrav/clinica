'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { API_URL } from './api';
import type { Role } from './types';

interface AuthContextValue {
  token: string | null;
  username: string | null;
  role: Role | null;
  doctorId: string | null;
  nombreCompleto: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'clinica_token';
const USERNAME_KEY = 'clinica_username';
const ROLE_KEY = 'clinica_role';
const DOCTOR_ID_KEY = 'clinica_doctor_id';
const NOMBRE_KEY = 'clinica_nombre';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of localStorage on mount
    setToken(localStorage.getItem(TOKEN_KEY));
    setUsername(localStorage.getItem(USERNAME_KEY));
    setRole(localStorage.getItem(ROLE_KEY) as Role | null);
    setDoctorId(localStorage.getItem(DOCTOR_ID_KEY));
    setNombreCompleto(localStorage.getItem(NOMBRE_KEY));
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? 'No se pudo iniciar sesión');
    }
    const data = await res.json();

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    localStorage.setItem(USERNAME_KEY, data.username);
    localStorage.setItem(ROLE_KEY, data.role);
    if (data.doctorId) localStorage.setItem(DOCTOR_ID_KEY, data.doctorId);
    else localStorage.removeItem(DOCTOR_ID_KEY);
    if (data.nombreCompleto) localStorage.setItem(NOMBRE_KEY, data.nombreCompleto);
    else localStorage.removeItem(NOMBRE_KEY);

    setToken(data.accessToken);
    setUsername(data.username);
    setRole(data.role);
    setDoctorId(data.doctorId ?? null);
    setNombreCompleto(data.nombreCompleto ?? null);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(DOCTOR_ID_KEY);
    localStorage.removeItem(NOMBRE_KEY);
    setToken(null);
    setUsername(null);
    setRole(null);
    setDoctorId(null);
    setNombreCompleto(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        role,
        doctorId,
        nombreCompleto,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
