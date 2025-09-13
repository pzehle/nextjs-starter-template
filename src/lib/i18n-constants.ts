export const SUPPORTED_LOCALES = ['en', 'de', 'es', 'fr', 'nl', 'it', 'ru', 'tr'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LANGUAGES = [
	{ code: 'de', label: 'Deutsch', countryCode: 'DE' },
	{ code: 'en', label: 'English', countryCode: 'GB' },
	{ code: 'es', label: 'Español', countryCode: 'ES' },
	{ code: 'fr', label: 'Français', countryCode: 'FR' },
	{ code: 'nl', label: 'Nederlands', countryCode: 'NL' },
	{ code: 'it', label: 'Italiano', countryCode: 'IT' },
	{ code: 'ru', label: 'Русский', countryCode: 'RU' },
	{ code: 'tr', label: 'Türkçe', countryCode: 'TR' },
] as const;