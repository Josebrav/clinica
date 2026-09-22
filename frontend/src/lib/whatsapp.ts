import type { Doctor, Turno } from './types';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

export function linkWhatsappTurno(doctor: Doctor, turno?: Turno): string {
  const nombreCompleto = `${doctor.nombre} ${doctor.apellido}`;
  let mensaje = `Hola! Quiero coordinar un turno con ${nombreCompleto} (${doctor.especialidad}).`;
  if (turno) {
    mensaje += ` Me interesa el turno del ${turno.fecha} a las ${turno.horaInicio}.`;
  }
  mensaje += ' Mi nombre es: ';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}
