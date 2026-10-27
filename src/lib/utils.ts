export const WHATSAPP_PHONE = '51916863361';
export const WHATSAPP_DISPLAY = '+51 916 863 361';

export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
  return `S/ ${formatted}`;
}

export function formatDuration(minutes: number): string {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes} min`;
}

export function buildWhatsAppBookingLink(serviceName: string, price?: number): string {
  let text = `¡Hola Bell Brows! Me gustaría agendar una cita para el servicio: *${serviceName}*`;
  if (price !== undefined) {
    text += ` (${formatPrice(price)})`;
  }
  text += `. ¿Qué fechas y horarios tienen disponibles?`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppPromoLink(promoTitle: string): string {
  const text = `¡Hola Bell Brows! Vi su promoción activa: *${promoTitle}*. Quisiera aprovecharla y agendar mi cita.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}
