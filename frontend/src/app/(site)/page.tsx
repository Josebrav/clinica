import { ArrowRight, CalendarCheck, MessageCircleHeart, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { DoctorPhoto } from '@/components/DoctorPhoto';
import { getDoctoresPublic } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import { stockImages } from '@/lib/stock-images';

const servicios = [
  {
    imagen: stockImages.consultas(),
    titulo: 'Consultas y seguimiento',
    descripcion: 'Atención personalizada en cada etapa de tu tratamiento.',
  },

  {
    imagen: stockImages.equipoMedico(),
    titulo: 'Equipo especializado',
    descripcion: 'Profesionales de distintas especialidades trabajando en conjunto.',
  },
  {
    imagen: stockImages.tratamientos(),
    titulo: 'Tratamientos personalizados',
    descripcion: 'Planes adaptados a las necesidades de cada paciente.',
  },
];

export default async function HomePage() {
  const doctores = (await getDoctoresPublic()).slice(0, 3);

  return (
    <div className="flex flex-col gap-16 pb-16 sm:gap-20">
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stockImages.hero()}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-teal-800/50" />
        <Container className="relative py-20 text-white sm:py-28 lg:py-32">
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Stethoscope size={28} />
          </span>
          <h1 className="max-w-2xl text-4xl font-bold sm:text-5xl">
            {siteConfig.nombre}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-blue-50">
            {siteConfig.tagline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/medicos"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 px-6 py-3 text-center font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              Ver médicos y turnos
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white shadow-lg transition hover:bg-green-500"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </Container>
      </section>

      <Container>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Qué encontrás en {siteConfig.nombre}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Acompañamiento médico integral, de la consulta al tratamiento.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.map((servicio) => (
            <div
              key={servicio.titulo}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={servicio.imagen}
                alt=""
                className="h-36 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{servicio.titulo}</h3>
                <p className="mt-1 text-sm text-gray-600">{servicio.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {doctores.length > 0 && (
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Nuestros médicos
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Conocé al equipo y coordiná tu turno.
              </p>
            </div>
            <Link
              href="/medicos"
              className="hidden items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 sm:flex"
            >
              Ver todos
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {doctores.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/medicos/${doctor.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <DoctorPhoto doctor={doctor} className="h-44 w-full" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">
                    {doctor.nombre} {doctor.apellido}
                  </h3>
                  <p className="text-sm text-blue-700">{doctor.especialidad}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/medicos"
            className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 sm:hidden"
          >
            Ver todos los médicos
            <ArrowRight size={15} />
          </Link>
        </Container>
      )}

      <Container>
        <div className="grid grid-cols-1 gap-6 rounded-2xl border bg-white p-8 shadow-sm sm:grid-cols-2 sm:items-center">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white">
              <CalendarCheck size={22} />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Coordinar tu turno es simple
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Elegí el médico y el horario que te quede cómodo, y confirmalo
              directamente con nuestra secretaría por WhatsApp.
            </p>
            <Link
              href="/medicos"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <MessageCircleHeart size={18} />
              Ir al listado de médicos
            </Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stockImages.consultas(700, 500)}
            alt=""
            className="h-48 w-full rounded-xl object-cover sm:h-56"
          />
        </div>
      </Container>
    </div>
  );
}
