import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['ro', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLocale = cookieStore.get('locale')?.value;
  const acceptLanguage = headerStore.get('accept-language') ?? '';
  const browserLocale = acceptLanguage.includes('ro') ? 'ro' : 'en';

  const locale = (locales.includes(cookieLocale as Locale) ? cookieLocale : browserLocale) as Locale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
