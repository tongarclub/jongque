'use client';

import { useTranslations } from 'next-intl';

// Custom hook for easy translation access
export function useTranslation(namespace = 'common') {
  const t = useTranslations(namespace);
  return { t };
}

// Helper hook for multiple namespaces
export function useMultipleTranslations(namespaces: string[]) {
  const translations: { [key: string]: any } = {};
  
  namespaces.forEach(namespace => {
    translations[namespace] = useTranslations(namespace);
  });
  
  return translations;
}

// Common translation hook with frequently used namespaces
export function useCommonTranslations() {
  return {
    common: useTranslations('common'),
    nav: useTranslations('nav'),
    auth: useTranslations('auth'),
    errors: useTranslations('errors'),
    success: useTranslations('success')
  };
}
