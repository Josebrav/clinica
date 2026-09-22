import { CalendarDays, Clock, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getDoctorPublic, getTurnosPublic } from '@/lib/api';
import { Container } from '@/components/Container';
import { DoctorPhoto } from '@/components/DoctorPhoto';
import { linkWhatsappTurno } from '@/lib/whatsapp';

export default async function MedicoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const doctor = await getDoctorPublic(id).catch(() => null);
  if (!doctor) {
    notFound();
  }

  const turnos = await getTurnosPublic(id);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm sm:flex-row">
        <DoctorPhoto
          doctor={doctor}
          className="h-40 w-40 shrink-0 rounded-xl"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {doctor.nombre} {doctor.apellido}
          </h1>
          <p className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {doctor.especialidad}
          </p>
          {doctor.descripcion && (
            <p className="mt-3 max-w-xl text-gray-600">{doctor.descripcion}</p>
          )}
          <a
            href={linkWhatsappTurno(doctor)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white shadow hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Coordinar turno por WhatsApp
          </a>
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold text-gray-900">
        Horarios disponibles
      </h2>

      {turnos.length === 0 ? (
        <p className="rounded-xl border bg-white p-6 text-center text-gray-500">
          No hay horarios disponibles cargados por el momento. Podés
          coordinar igual por WhatsApp.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {turnos.map((turno) => (
            <li
              key={turno.id}
              className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                <p className="flex items-center gap-1.5 font-medium text-gray-900">
                  <CalendarDays size={15} className="text-blue-700" />
                  {turno.fecha}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Clock size={14} />
                  {turno.horaInicio} hs
                </p>
              </div>
              <a
                href={linkWhatsappTurno(doctor, turno)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              >
                Elegir
              </a>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
