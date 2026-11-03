/**
 * Utilidad de optimización y conversión de imágenes en el cliente a WebP.
 * - Redimensiona proporcionalmente a resolución óptima (máx 1200px de ancho/alto).
 * - Convierte a formato 'image/webp' con compresión balanceada (calidad ~0.82).
 * - Devuelve un objeto File listo para subir a Supabase Storage con contentType 'image/webp'.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 a 1 (recomendado: 0.82)
}

export async function optimizeImageToWebP(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  // Si no estamos en entorno de navegador, devolver el archivo original
  if (typeof window === 'undefined' || !window.HTMLCanvasElement) {
    return file;
  }

  // Si no es un archivo de imagen, devolver original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    // Usar ImageBitmap o Image
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calcular dimensiones proporcionales sin agrandar imágenes pequeñas
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback si no hay contexto canvas
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Crear nuevo nombre con extensión .webp
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const cleanBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
          const webpFileName = `${cleanBaseName}.webp`;

          const optimizedFile = new File([blob], webpFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // En caso de error de lectura, retornar archivo original
      resolve(file);
    };

    img.src = objectUrl;
  });
}

