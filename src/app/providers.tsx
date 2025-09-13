'use client';

import { NextIntlClientProvider } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/layout/PageShell';
import ThemeProviderWrapper from '@/components/layout/ThemeProviderWrapper';
import { Toaster } from '@/components/ui/sonner';
import { SupportedLocale } from '@/lib/i18n-constants';

import './global.css';

import { ProgressProvider } from '@bprogress/next/app';
import { Analytics } from '@vercel/analytics/next';

export default function Providers({
	children,
	locale,
	messages,
}: {
	children: React.ReactNode;
	locale: SupportedLocale;
	messages: Record<string, unknown>;
}) {
	return (
		<>
			<Analytics />
			<NextIntlClientProvider locale={locale} messages={messages}>
				<ProgressProvider
					color="var(--sidebar-accent-foreground)"
					options={{
						showSpinner: false,
					}}
				>
					<ThemeProviderWrapper>
						<PageShell>
							<PageHeader />
							{children}
							<Toaster richColors position="bottom-right" />
						</PageShell>
					</ThemeProviderWrapper>
				</ProgressProvider>
			</NextIntlClientProvider>
		</>
	);
}
