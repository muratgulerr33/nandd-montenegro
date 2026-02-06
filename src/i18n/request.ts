import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { hasLocale } from 'next-intl';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  const localeMessages = (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>;
  let homeNamespace: Record<string, unknown>;
  if (locale === routing.defaultLocale) {
    homeNamespace = (await import('@/content/nandd/home.json')).default as Record<string, unknown>;
  } else {
    try {
      homeNamespace = (await import(`@/content/nandd/home.${locale}.json`)).default as Record<string, unknown>;
    } catch {
      homeNamespace = (await import('@/content/nandd/home.json')).default as Record<string, unknown>;
    }
  }
  return {
    locale,
    messages: { ...localeMessages, home: homeNamespace }
  };
});

