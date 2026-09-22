import { Mail, MessageCircle, Phone, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Container } from './Container';
import { siteConfig } from '@/lib/site-config';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20">
      <div className="hidden bg-gradient-to-r from-blue-800 to-teal-700 text-white sm:block">
        <Container className="flex items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${siteConfig.telefono}`}
              className="flex items-center gap-1.5 hover:text-blue-100"
            >
              <Phone size={13} />
              {siteConfig.telefono}
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-blue-100"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-1.5 hover:text-blue-100"
            >
              <Mail size={13} />
              {siteConfig.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="hover:text-blue-100">
              <FaFacebook size={14} />
            </a>
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="hover:text-blue-100">
              <FaInstagram size={14} />
            </a>
            <a href={siteConfig.social.linkedin} aria-label="LinkedIn" className="hover:text-blue-100">
              <FaLinkedin size={14} />
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b bg-white/95 backdrop-blur">
        <Container className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 text-white">
              <Stethoscope size={20} />
            </span>
            <span className="text-lg font-semibold text-gray-900">
              {siteConfig.nombre}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
            <Link href="/" className="transition hover:text-blue-700">
              Inicio
            </Link>
            <Link href="/medicos" className="transition hover:text-blue-700">
              Médicos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden rounded-lg border-2 border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:inline-block"
            >
              Acceso
            </Link>
            <Link
              href="/medicos"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Ver médicos
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
