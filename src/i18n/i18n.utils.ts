/**
 * This file contains a factory function for creating a type-safe translator
 * for rendering transactional emails.
 *
 * It uses `use-intl/core` because email rendering happens in a context
 * where the standard `next-intl` providers are not available. This allows us
 * to render emails with the correct translations outside of the typical
 * React component tree.
 */
import { createTranslator } from 'use-intl/core';

import { Locale, translations } from '@/i18n/translations';

/**
 * Creates a fully-typed translator instance for a specific email template.
 * @param locale The locale to use for the translator.
 * @param emailKey The key corresponding to the email template's translations.
 * @returns A type-safe translator function (`t`).
 */
export function createEmailTranslator<
	T extends keyof (typeof translations)[Locale]['emails'],
>(locale: Locale, emailKey: T) {
	const emailTranslations = (translations[locale]?.emails?.[emailKey] ??
		{}) as (typeof translations)[Locale]['emails'][T];
	return createTranslator({
		locale,
		messages: emailTranslations,
	});
}
