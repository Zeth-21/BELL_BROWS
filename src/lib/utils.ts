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

// ============================================================================
// 5 CATEGORÍAS PRINCIPALES DEL CATÁLOGO
// ============================================================================
export const SERVICE_CATEGORIES = [
  'Pestañas',
  'Uñas',
  'Cabello',
  'Micro',
  'Limpieza Facial',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const MAIN_CATEGORIES = [
  'Todos',
  'Pestañas',
  'Uñas',
  'Cabello',
  'Micro',
  'Limpieza Facial',
] as const;

export type MainCategory = (typeof MAIN_CATEGORIES)[number];

/**
 * Normaliza y reclasifica automáticamente cualquier servicio en una de las 5 categorías oficiales:
 * 1. Pestañas (lifting, rizado, extensiones clásicas, volumen ruso, hawaiana, etc.)
 * 2. Micro (microblading, micropigmentación, lip blush, diseño/laminado de cejas, henna)
 * 3. Limpieza Facial (tratamientos faciales, hidrodermoabrasión, peeling, mascarillas glow, etc.)
 * 4. Uñas (manicure, pedicure, acripie, uñas acrílicas, gel, etc.)
 * 5. Cabello (ondulación, corte, peinado, spa capilar, alisado, etc.)
 */
export function normalizeServiceCategory(service?: {
  title?: string;
  category?: string;
  description?: string | null;
}): ServiceCategory {
  if (!service) return 'Pestañas';

  const cat = (service.category || '').toLowerCase().trim();
  const title = (service.title || '').toLowerCase().trim();
  const desc = (service.description || '').toLowerCase().trim();
  const text = `${cat} ${title} ${desc}`;

  // Coincidencia exacta directa
  if (cat === 'pestañas' || cat === 'pestanas') return 'Pestañas';
  if (cat === 'uñas' || cat === 'unas') return 'Uñas';
  if (cat === 'cabello') return 'Cabello';
  if (cat === 'micro') return 'Micro';
  if (cat === 'limpieza facial') return 'Limpieza Facial';

  // 1. Pestañas: lifting, rizado, volumen ruso, extensiones, pestañas postizas, rímel
  if (
    text.includes('pestaña') ||
    text.includes('pestana') ||
    text.includes('lash') ||
    text.includes('lifting') ||
    text.includes('volumen ruso') ||
    text.includes('rímel') ||
    text.includes('rimel') ||
    text.includes('hawaiana') ||
    text.includes('rizado')
  ) {
    return 'Pestañas';
  }

  // 2. Micro: microblading, micropigmentación, lip blush, cejas, laminado, henna, delineado
  if (
    text.includes('micro') ||
    text.includes('ceja') ||
    text.includes('brow') ||
    text.includes('pigmentaci') ||
    text.includes('lip') ||
    text.includes('labio') ||
    text.includes('henna') ||
    text.includes('laminaci') ||
    text.includes('lamination')
  ) {
    return 'Micro';
  }

  // 3. Limpieza Facial: hidrodermoabrasión, facial, cutis, rostro, skincare, peeling, dermapen, mesoterapia
  if (
    text.includes('facial') ||
    text.includes('limpieza') ||
    text.includes('hidrodermoabr') ||
    text.includes('peeling') ||
    text.includes('dermapen') ||
    text.includes('skincare') ||
    text.includes('rejuvenecimiento') ||
    text.includes('cutis') ||
    text.includes('rostro')
  ) {
    return 'Limpieza Facial';
  }

  // 4. Uñas: manicure, pedicure, acripie, acrílicas, gel, esmaltado, polygel
  if (
    text.includes('uña') ||
    text.includes('una') ||
    text.includes('mani') ||
    text.includes('pedi') ||
    text.includes('acripie') ||
    text.includes('acrílic') ||
    text.includes('acrilic') ||
    text.includes('gel') ||
    text.includes('esmaltado')
  ) {
    return 'Uñas';
  }

  // 5. Cabello: ondulación, corte, fade, peinado, alisado, capilar, keratina capilar, balayage
  if (
    text.includes('cabello') ||
    text.includes('ondulaci') ||
    text.includes('corte') ||
    text.includes('barber') ||
    text.includes('fade') ||
    text.includes('peinado') ||
    text.includes('alisado') ||
    text.includes('capilar') ||
    text.includes('pelo')
  ) {
    return 'Cabello';
  }

  return 'Pestañas';
}

