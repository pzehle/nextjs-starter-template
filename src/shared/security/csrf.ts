import { NextRequest } from 'next/server';

/**
 * Generates a cryptographically secure random string to be used as a CSRF token.
 * This function uses the Web Crypto API, which is available in the Edge runtime.
 * @returns {string} A 32-byte random string, hex-encoded.
 */
export function generateCSRFToken(): string {
	const buffer = new Uint8Array(32);
	crypto.getRandomValues(buffer);
	return Array.from(buffer)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Validates the CSRF token for an API route.
 * This implements the Double Submit Cookie pattern. It compares the token from the
 * 'csrf-token' cookie with the token from the 'x-csrf-token' header.
 * This function is intended to be called at the beginning of your API route handlers.
 *
 * @param {NextRequest} request The incoming request object.
 * @returns {boolean} True if the tokens match and are not empty, false otherwise.
 */
export function validateCSRF(request: NextRequest): boolean {
	const tokenFromCookie = request.cookies.get('csrf-token')?.value;
	const tokenFromHeader = request.headers.get('x-csrf-token');

	if (!tokenFromCookie || !tokenFromHeader) {
		console.error('CSRF validation failed: Missing token in cookie or header.');
		return false;
	}

	if (tokenFromCookie !== tokenFromHeader) {
		console.error('CSRF validation failed: Token mismatch.');
		return false;
	}

	return true;
}
