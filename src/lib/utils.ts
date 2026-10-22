export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
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
  const phone = '5215512345678'; // WhatsApp comercial de Bell Brows
  let text = `¡Hola Bell Brows! Me gustaría agendar una cita para el servicio: *${serviceName}*`;
  if (price !== undefined) {
    text += ` (${formatPrice(price)})`;
  }
  text += `. ¿Qué fechas y horarios tienen disponibles?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppPromoLink(promoTitle: string): string {
  const phone = '5215512345678';
  const text = `¡Hola Bell Brows! Vi su promoción activa: *${promoTitle}*. Quisiera aprovecharla y agendar mi cita.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
