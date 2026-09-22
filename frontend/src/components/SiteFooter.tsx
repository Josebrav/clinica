import { Clock, Mail, MapPin, Phone, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Container } from './Container';
import { siteConfig } from '@/lib/site-config';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-white">
      <Container className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 text-white">
              <Stethoscope size={18} />
            </span>
            <span className="font-semibold text-gray-900">
              {siteConfig.nombre}
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-500">{siteConfig.tagline}</p>
          <div className="mt-4 flex items-center gap-3 text-gray-400">
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="hover:text-blue-700">
              <FaFacebook size={18} />
            </a>
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="hover:text-blue-700">
              <FaInstagram size={18} />
            </a>
            <a href={siteConfig.social.linkedin} aria-label="LinkedIn" className="hover:text-blue-700">
              <FaLinkedin size={18} />
            </a>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <h3 className="mb-3 font-semibold text-gray-900">Contacto</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-blue-700" />
              {siteConfig.direccion}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-blue-700" />
              {siteConfig.telefono}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-blue-700" />
              {siteConfig.email}
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-blue-700" />
              {siteConfig.horario}
            </li>
          </ul>
        </div>

        <div className="text-sm text-gray-600 sm:text-right">
          <h3 className="mb-3 font-semibold text-gray-900">Enlaces</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/medicos" className="hover:text-blue-700">
                Ver médicos
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-blue-700">
                Acceso secretaría
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {siteConfig.nombre}. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
