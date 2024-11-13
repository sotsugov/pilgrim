import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const sans = localFont({
  src: './fonts/RethinkSans-VariableFont_wght.ttf',
  variable: '--font-sans',
  weight: '100 900',
});

const title = localFont({
  src: './fonts/Modelo-Thin.woff',
  variable: '--font-title',
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
      className={`${sans.variable} ${title.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col justify-between pt-0 md:pt-8 p-8">
            <main className="max-w-[80ch] mx-auto w-full flex-1 flex">
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
    <footer className="mt-12 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        <a
          className="uppercase font-semibold no-underline text-muted-foreground text-xs hover:text-foreground transition-colors"
          href="https://isv.ee"
          target="_blank"
          rel="noopener noreferrer"
        >
          A project by ISV
        </a>
      </div>
    </footer>
  );
}
