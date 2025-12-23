import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'en', 'ar', 'ru', 'de', 'fr', 'it', 'es', 'pt', 'nl', 'sr', 'ka'],
  defaultLocale: 'tr',
  localePrefix: 'always'
});

