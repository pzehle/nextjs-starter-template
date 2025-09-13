'use client';

import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface PageHeaderProps {
	title?: string;
	showSwitchers?: boolean;
}

export function PageHeader({ title = process.env.NEXT_PUBLIC_PROJECT_NAME, showSwitchers = true }: PageHeaderProps) {
	return (
		<header className="bg-card/50 border-b backdrop-blur-sm">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-4">
						<h1 className="text-foreground text-xl font-semibold">{title}</h1>
					</div>

					{showSwitchers && (
						<div className="flex items-center space-x-4">
							<LocaleSwitcher />
							<ThemeSwitcher />
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
