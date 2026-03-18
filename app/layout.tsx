import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Pratisig Consulting Service',
    template: '%s | Pratisig',
  },
  description: 'Plateforme multiservice : immobilier, transfert d\'argent, alimentation, e-commerce, livraison.',
  keywords: ['Sénégal', 'immobilier', 'e-commerce', 'transfert d\'argent', 'livraison', 'Dakar'],
  authors: [{ name: 'Pratisig Consulting Service' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    siteName: 'Pratisig Consulting Service',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
