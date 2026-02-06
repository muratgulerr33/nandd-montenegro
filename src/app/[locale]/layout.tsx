import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { Geist, Manrope } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { PageTransitionController } from '@/components/page-transition-controller';
import '../globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "NANDD Montenegro",
  description: "Anahtar Teslim Yeni Bir Hayat — Montenegro",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const noFlashScript = `(function(){try{var k='nandd-theme';var s=typeof localStorage!=='undefined'?localStorage.getItem(k):null;var d=s==='dark'||(s!=='light'&&typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(typeof document!=='undefined')document.documentElement.classList.toggle('dark',!!d);}catch(e){}})();`;

  return (
      <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${geist.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/webp" href="/icon.webp" />
        <link rel="shortcut icon" type="image/webp" href="/icon.webp" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="antialiased bg-background text-foreground font-sans" suppressHydrationWarning>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Suspense fallback={null}>
              <PageTransitionController />
            </Suspense>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

