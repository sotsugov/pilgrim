import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: "./fonts/RethinkSans-VariableFont_wght.ttf",
  variable: "--font-sans",
  weight: "100 900",
});

const title = localFont({
  src: "./fonts/Modelo-Thin.woff",
  variable: "--font-title",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pilgrim",
  description: "CYOA: Delve Deep. Decipher the Unknown. Determine Your Fate.",
  creator: "Igor Sotsugov",
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
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex items-center justify-center p-6">
              <div className="max-w-[80ch] w-full">{children}</div>
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
    <footer className="flex flex-col py-6 mt-auto items-center text-center">
      <a
        className="uppercase font-semibold tracking-tight no-underline text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
        href="https://isv.ee"
        target="_blank"
        rel="noopener noreferrer"
      >
        A project by ISV
      </a>
    </footer>
  );
}
