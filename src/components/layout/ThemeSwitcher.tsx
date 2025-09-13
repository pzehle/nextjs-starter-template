'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { Switch } from '@/components/ui/switch';

import { IconMoon, IconSun } from '@tabler/icons-react';

export function ThemeSwitcher() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted ? resolvedTheme === 'dark' : false;

	return (
		<div className="flex items-center space-x-2">
			<IconSun className="size-4" />
			<Switch checked={isDark} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
			<IconMoon className="size-4" />
		</div>
	);
}
