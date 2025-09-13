import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname:
					'viralspoon-dev.ebe311c37ee499a3e0311197d1c1d12a.eu.r2.cloudflarestorage.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname:
					'viralspoon-preview.ebe311c37ee499a3e0311197d1c1d12a.eu.r2.cloudflarestorage.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname:
					'viralspoon-production.ebe311c37ee499a3e0311197d1c1d12a.eu.r2.cloudflarestorage.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');
export default withNextIntl(nextConfig);
