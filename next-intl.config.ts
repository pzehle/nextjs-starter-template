import { SUPPORTED_LOCALES } from '@/lib/i18n-constants';

const nextIntlConfig = {
	locales: [...SUPPORTED_LOCALES],
	defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
	localeDetection: true,
};

export default nextIntlConfig;
