// Internationalization configuration for JongQue
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['th', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'th';

// Locale labels
export const localeLabels: Record<Locale, { native: string; english: string; flag: string }> = {
  th: {
    native: 'ไทย',
    english: 'Thai',
    flag: '🇹🇭'
  },
  en: {
    native: 'English',
    english: 'English', 
    flag: '🇺🇸'
  }
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) notFound();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

// Utility functions
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromPath(path: string): Locale | null {
  const segments = path.split('/');
  const firstSegment = segments[1];
  return isValidLocale(firstSegment) ? firstSegment : null;
}

export function getPathWithoutLocale(path: string): string {
  const locale = getLocaleFromPath(path);
  if (locale) {
    return path.replace(`/${locale}`, '') || '/';
  }
  return path;
}

export function getLocalizedPath(path: string, locale: Locale): string {
  const pathWithoutLocale = getPathWithoutLocale(path);
  return locale === defaultLocale ? pathWithoutLocale : `/${locale}${pathWithoutLocale}`;
}
