import { useTranslations } from 'next-intl';

export default function DashboardPage() {
	const t = useTranslations('pages');

	return t('home.content');
}
