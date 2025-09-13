import { ReactNode } from 'react';

interface PageContentProps {
	children: ReactNode;
	className?: string;
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageContent({ children, className = '', maxWidth = 'full' }: PageContentProps) {
	const maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		full: 'max-w-none',
	};

	return (
		<main className={`flex-1 ${maxWidthClasses[maxWidth]} ${className}`}>
			<div className="container mx-auto px-4 py-6">
				{children}
			</div>
		</main>
	);
}