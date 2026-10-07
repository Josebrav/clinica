import { Mail, MessageCircle, Phone, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Container } from './Container';
import { siteConfig } from '@/lib/site-config';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20">
      <div className="hidden bg-stone-800 text-white sm:block">
        <Container className="flex items-center justify-between py-2 text-xs">
          <div className="flex items-center gap-5">
            <a
              href={`tel:${siteConfig.telefono}`}
              className="flex items-center gap-1.5 hover:text-olive-300"
            >
              <Phone size={13} />
              {siteConfig.telefono}
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-olive-300"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-1.5 hover:text-olive-300"
            >
              <Mail size={13} />
              {siteConfig.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="hover:text-olive-300">
              <FaFacebook size={14} />
            </a>
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="hover:text-olive-300">
              <FaInstagram size={14} />
            </a>
            <a href={siteConfig.social.linkedin} aria-label="LinkedIn" className="hover:text-olive-300">
              <FaLinkedin size={14} />
            </a>
          </div>
        </Container>
      </div>

      <div className="border-b border-stone-200 bg-stone-50/95 backdrop-blur">
        <Container className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive-700 text-white">
              <Stethoscope size={20} />
            </span>
            <span className="text-lg font-semibold text-stone-900">
              {siteConfig.nombre}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 md:flex">
            <Link href="/" className="transition hover:text-olive-700">
              Inicio
            </Link>
            <Link href="/medicos" className="transition hover:text-olive-700">
              Médicos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden rounded-lg border-2 border-olive-700 px-4 py-2 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 sm:inline-block"
            >
              Acceso
            </Link>
            <Link
              href="/medicos"
              className="rounded-lg bg-olive-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-olive-800 hover:shadow-md"
            >
              Ver médicos
            </Link>
          </div>
        </Container>
      </div>
    </header>
  );
}
