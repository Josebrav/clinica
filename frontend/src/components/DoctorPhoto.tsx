import { UserRound } from 'lucide-react';
import { API_URL } from '@/lib/api';
import type { Doctor } from '@/lib/types';

const GRADIENTES = [
  'from-blue-500 to-teal-400',
  'from-indigo-500 to-blue-400',
  'from-teal-500 to-emerald-400',
  'from-sky-500 to-cyan-400',
];

function gradienteFor(id: string) {
  const suma = id
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTES[suma % GRADIENTES.length];
}

export function DoctorPhoto({
  doctor,
  className = '',
}: {
  doctor: Pick<Doctor, 'id' | 'nombre' | 'apellido' | 'fotoUrl'>;
  className?: string;
}) {
  if (doctor.fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${API_URL}${doctor.fotoUrl}`}
        alt={`${doctor.nombre} ${doctor.apellido}`}
        className={`object-cover ${className}`}
      />
    );
  }

  const iniciales = `${doctor.nombre[0] ?? ''}${doctor.apellido[0] ?? ''}`.toUpperCase();

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br text-white ${gradienteFor(
        doctor.id,
      )} ${className}`}
    >
      <UserRound className="absolute opacity-25" size={56} />
      <span className="relative text-xl font-semibold">{iniciales}</span>
    </div>
  );
}
