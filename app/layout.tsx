import type { Metadata, Viewport } from 'next';
import { Archivo, Spectral } from 'next/font/google';
import { LocaleProvider } from '@/lib/i18n/provider';
import './globals.css';

/**
 * next/font downloads these at build time and serves them from our own origin,
 * so a running page never calls out to Google (FR-09).
 */
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Family Tree',
  description: 'Build a family tree in your browser and look at it in three dimensions. Nothing is uploaded.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0e0e10',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spectral.variable} ${archivo.variable}`}>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
