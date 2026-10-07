import { UserRound } from 'lucide-react';
import { API_URL } from '@/lib/api';
import type { Doctor } from '@/lib/types';

const GRADIENTES = [
  'from-olive-600 to-stone-500',
  'from-stone-600 to-olive-500',
  'from-olive-700 to-olive-400',
  'from-stone-700 to-stone-400',
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
    const src = doctor.fotoUrl.startsWith('http')
      ? doctor.fotoUrl
      : `${API_URL}${doctor.fotoUrl}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
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
