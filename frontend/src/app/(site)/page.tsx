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
    titulo: 'Accesibilidad',
    descripcion: 'Un equipo de trabajo fexible a tus tiempos y requerimientos.',
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
  {
    imagen: stockImages.laboratorio(),
    titulo: 'Análisis Clínicos',
    descripcion: 'Sistema integrado con laboratorio de alta complejidad.',
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
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/60 to-olive-900/40" />
        <Container className="relative flex flex-col items-center py-20 text-center text-white sm:py-28 lg:py-32">
          <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Stethoscope size={28} />
          </span>
          <h1 className="text-7xl font-bold sm:text-8xl lg:text-9xl">
            {siteConfig.marca}
          </h1>
          <p className="mt-4 text-2xl font-medium text-olive-100 sm:text-3xl">
            {siteConfig.subtitulo}
          </p>
          <p className="mt-4 max-w-2xl text-xl text-stone-200 sm:text-2xl">
            {siteConfig.tagline}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/medicos"
              className="rounded-lg bg-olive-600 px-6 py-3 text-center font-semibold text-white shadow-lg transition hover:bg-olive-500 hover:shadow-xl"
            >
              Ver médicos y turnos
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-green-700 px-6 py-3 text-center font-semibold text-white shadow-lg transition hover:bg-green-600"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </Container>
      </section>

      <Container>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
            Qué encontrás en {siteConfig.nombre}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Acompañamiento médico integral, de la consulta al tratamiento.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.map((servicio) => (
            <div
              key={servicio.titulo}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm transition hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={servicio.imagen}
                alt=""
                className="h-36 w-full object-cover grayscale-[20%]"
              />
              <div className="p-4">
                <h3 className="font-semibold text-stone-900">{servicio.titulo}</h3>
                <p className="mt-1 text-sm text-stone-600">{servicio.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {doctores.length > 0 && (
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                Nuestros médicos
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Conocé al equipo y coordiná tu turno.
              </p>
            </div>
            <Link
              href="/medicos"
              className="hidden items-center gap-1 text-sm font-semibold text-olive-700 hover:text-olive-800 sm:flex"
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
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <DoctorPhoto doctor={doctor} className="h-44 w-full" />
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900">
                    {doctor.nombre} {doctor.apellido}
                  </h3>
                  <p className="text-sm text-olive-700">{doctor.especialidad}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/medicos"
            className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-olive-700 hover:text-olive-800 sm:hidden"
          >
            Ver todos los médicos
            <ArrowRight size={15} />
          </Link>
        </Container>
      )}

      <Container>
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-stone-200 bg-stone-50 p-8 shadow-sm sm:grid-cols-2 sm:items-center">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-olive-700 text-white">
              <CalendarCheck size={22} />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-stone-900">
              Coordinar tu turno es simple
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Elegí el médico y el horario que te quede cómodo, y confirmalo
              directamente con nuestra secretaría por WhatsApp.
            </p>
            <Link
              href="/medicos"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-olive-700 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-olive-800 hover:shadow-md"
            >
              <MessageCircleHeart size={18} />
              Ir al listado de médicos
            </Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stockImages.consultas(700, 500)}
            alt=""
            className="h-48 w-full rounded-xl object-cover grayscale-[20%] sm:h-56"
          />
        </div>
      </Container>
    </div>
  );
}
