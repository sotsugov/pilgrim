import { ThemeProvider } from '@/components/theme-provider';
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
    <html
      lang="en"
      className={`${figtree.variable} ${modelo.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-6 row-start-2 items-center">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center text-center">
      <a
        className="uppercase font-semibold tracking-tight no-underline text-xs text-muted hover:text-muted-foreground transition-colors"
        href="https://isv.ee"
        target="_blank"
        rel="noopener noreferrer"
      >
        A project by ISV
      </a>
    </footer>
  );
}
