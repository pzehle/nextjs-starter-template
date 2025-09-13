import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import {
	SUPPORTED_LOCALES,
	type SupportedLocale,
} from '@/lib/i18n-constants';

export default getRequestConfig(async () => {
	const cookieStore = await cookies();
	const headersList = await headers();

	const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

	const acceptLanguage = headersList.get('accept-language') || '';
	const browserLocale = acceptLanguage
		.split(',')[0]
		.split('-')[0]
		.toLowerCase();

	const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en';
	const locale = cookieLocale || browserLocale || defaultLocale;

	const finalLocale = SUPPORTED_LOCALES.includes(locale as SupportedLocale)
		? locale
		: defaultLocale;

	return {
		locale: finalLocale,
		messages: (await import(`../../translations/${finalLocale}.json`))
			.default,
	};
});
