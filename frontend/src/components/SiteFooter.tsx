import { Clock, Mail, MapPin, Phone, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Container } from './Container';
import { siteConfig } from '@/lib/site-config';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-100">
      <Container className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-olive-700 text-white">
              <Stethoscope size={18} />
            </span>
            <span className="font-semibold text-stone-900">
              {siteConfig.nombre}
            </span>
          </div>
          <p className="mt-3 text-sm text-stone-500">{siteConfig.tagline}</p>
          <div className="mt-4 flex items-center gap-3 text-stone-400">
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="hover:text-olive-700">
              <FaFacebook size={18} />
            </a>
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="hover:text-olive-700">
              <FaInstagram size={18} />
            </a>
            <a href={siteConfig.social.linkedin} aria-label="LinkedIn" className="hover:text-olive-700">
              <FaLinkedin size={18} />
            </a>
          </div>
        </div>

        <div className="text-sm text-stone-600">
          <h3 className="mb-3 font-semibold text-stone-900">Contacto</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-olive-700" />
              {siteConfig.direccion}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-olive-700" />
              {siteConfig.telefono}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-olive-700" />
              {siteConfig.email}
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-olive-700" />
              {siteConfig.horario}
            </li>
          </ul>
        </div>

        <div className="text-sm text-stone-600 sm:text-right">
          <h3 className="mb-3 font-semibold text-stone-900">Enlaces</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/medicos" className="hover:text-olive-700">
                Ver médicos
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-olive-700">
                Acceso secretaría
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-stone-200 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {siteConfig.nombre}. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
