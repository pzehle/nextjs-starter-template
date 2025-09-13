'use client';

import { useTransition } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useLocale } from 'next-intl';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { LANGUAGES } from '@/lib/i18n-constants';

import { useRouter } from '@bprogress/next/app';
export function LocaleSwitcher() {
	const locale = useLocale();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function onChange(newLocale: string) {
		startTransition(() => {
			document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
			router.refresh();
		});
	}

	const currentLanguage = LANGUAGES.find((lang) => lang.code === locale);

	return (
		<Select onValueChange={onChange} value={locale} disabled={isPending}>
			<SelectTrigger className="h-9 w-fit px-3">
				<ReactCountryFlag
					countryCode={currentLanguage?.countryCode || 'GB'}
					svg
					style={{
						width: '0.875rem',
						height: '0.6875rem',
						marginRight: 5,
					}}
				/>
			</SelectTrigger>
			<SelectContent>
				{LANGUAGES.map((language) => (
					<SelectItem key={language.code} value={language.code}>
						<span className="flex items-center gap-2">
							<ReactCountryFlag
								countryCode={language.countryCode}
								svg
								style={{
									width: '0.875rem',
									height: '0.6875rem',
									marginRight: 5,
								}}
							/>
							<span>{language.label}</span>
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
