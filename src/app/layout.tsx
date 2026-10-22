import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BELL BROWS | Estudio Profesional de Cejas, Pestañas & Belleza',
  description: 'Especialistas en Microblading, Brow Lamination, Lifting de Pestañas y cuidado facial. Resalta tu belleza natural con técnicas de vanguardia.',
  keywords: ['microblading', 'cejas', 'pestañas', 'brow lamination', 'lash lifting', 'belleza', 'spa facial'],
  authors: [{ name: 'BELL BROWS' }],
  openGraph: {
    title: 'BELL BROWS | Estudio Profesional de Cejas & Belleza',
    description: 'Resalta tu belleza natural con técnicas hiperrealistas de microblading, laminado y cuidado facial.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'BELL BROWS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0c0a09',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
