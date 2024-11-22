import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';

const sans = localFont({
  src: '../public/fonts/InterVariable.ttf',
  display: 'swap',
  variable: '--font-sans',
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
    <html lang="en" className={`${sans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col justify-between pt-0 md:pt-8 p-6">
            <main className="max-w-2xl mx-auto flex-grow flex">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-center p-6">
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
