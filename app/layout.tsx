import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const figtree = localFont({
  src: './fonts/Figtree-VariableFont_wght.ttf',
  variable: '--font-figtree',
  weight: '100 900',
});

const modelo = localFont({
  src: './fonts/Modelo-Thin.woff',
  variable: '--font-modelo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pilgrim',
  description: 'CYOA: Delve Deep. Decipher the Unknown. Determine Your Fate.',
  creator: 'Igor Sotsugov',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${modelo.variable}`}>
      <body className="font-sans antialiased bg-gray-950">{children}</body>
    </html>
  );
}
