import { supabase } from './client';

const BUCKET_NAME = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'bell_brows_media';

export async function uploadMediaFile(
  file: File,
  folder: 'services' | 'promotions' = 'services'
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Sanitize filename and create unique path
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
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
