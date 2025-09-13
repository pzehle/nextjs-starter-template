import { NextRequest, NextResponse } from 'next/server';

import { generateCSRFToken } from '@/shared/security/csrf';

export function middleware(req: NextRequest) {
	// For preflight (OPTIONS) requests, respond immediately with 204 No Content
	if (req.method === 'OPTIONS') {
		return new NextResponse(null, { status: 204 });
	}

	const response = NextResponse.next();

	// Generate and set CSRF token for all requests
	const token = generateCSRFToken();
	response.cookies.set('csrf-token', token, {
		httpOnly: false,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
	});

	return response;
}

export const config = {
	matcher: [
		/*
		 * Run on all routes except:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico, sitemap.xml, robots.txt
		 * - Images and other assets
		 */
		'/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
