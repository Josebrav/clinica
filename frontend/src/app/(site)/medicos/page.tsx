import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getDoctoresPublic } from '@/lib/api';
import { Container } from '@/components/Container';
import { DoctorPhoto } from '@/components/DoctorPhoto';

export default async function MedicosPage() {
  const doctores = await getDoctoresPublic();

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nuestros médicos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Elegí un médico para ver sus horarios disponibles.
        </p>
      </div>

      {doctores.length === 0 ? (
        <p className="rounded-xl border bg-white p-6 text-center text-gray-500">
          Todavía no hay médicos cargados. Volvé a intentarlo más tarde.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {doctores.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/medicos/${doctor.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <DoctorPhoto doctor={doctor} className="h-48 w-full" />
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-semibold text-gray-900">
                  {doctor.nombre} {doctor.apellido}
                </h2>
                <p className="text-sm text-blue-700">{doctor.especialidad}</p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-gray-500 transition group-hover:text-blue-700">
                  Ver turnos disponibles
                  <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
