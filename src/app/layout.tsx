import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';

import { SupportedLocale } from '@/lib/i18n-constants';

import Providers from './providers';

import './global.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: process.env.NEXT_PUBLIC_PROJECT_NAME,
	description: '',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${inter.variable} antialiased`}>
				<Providers locale={locale as SupportedLocale} messages={messages}>
					{children}
				</Providers>
			</body>
		</html>
	);
}
