import { supabase } from './client';
import { optimizeImageToWebP } from '@/lib/imageOptimization';

const BUCKET_NAME = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'bell_brows_media';

/**
 * Sube una imagen de servicio ('before' o 'after') a Supabase Storage.
 * - Optimiza y convierte automáticamente a formato .webp.
 * - Asigna nombre estructurado: services/[timestamp]-[id]-[type].webp
 * - Envía contentType: 'image/webp' al bucket bell_brows_media.
 */
export async function uploadServiceImage(
  file: File,
  type: 'before' | 'after',
  serviceId?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    // 1. Optimizar y convertir a WebP en el cliente antes de la subida
    const optimizedFile = await optimizeImageToWebP(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.85,
    });

    // 2. Estructura de nombre: [timestamp]-[id]-[type].webp
    const timestamp = Date.now();
    const safeId = serviceId
      ? serviceId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 16)
      : Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}-${safeId}-${type}.webp`;
    const filePath = `services/${fileName}`;

    // 3. Subir a Supabase Storage con contentType: 'image/webp'
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, optimizedFile, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // 4. Obtener URL pública
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Error inesperado al subir la imagen del servicio' };
  }
}

/**
 * Función general para subir archivos multimedia (servicios, promociones),
 * aplicando optimización WebP para imágenes.
 */
export async function uploadMediaFile(
  file: File,
  folder: 'services' | 'promotions' = 'services',
  customSuffix?: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    let uploadFile = file;
    let fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    let contentType = file.type || 'image/jpeg';

    if (file.type.startsWith('image/')) {
      uploadFile = await optimizeImageToWebP(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
      fileExt = 'webp';
      contentType = 'image/webp';
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const suffix = customSuffix ? `-${customSuffix}` : '';
    const cleanFileName = `${timestamp}-${randomId}${suffix}.${fileExt}`;
    const filePath = `${folder}/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, uploadFile, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Error inesperado al subir la imagen' };
  }
}
