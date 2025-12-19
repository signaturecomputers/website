import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/checkout', '/profile'];

// Admin routes that require admin access
const adminRoutes = ['/admindashboard', '/admin'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // For now, we rely on client-side auth checks since Firebase Auth
    // doesn't work directly in Edge middleware. 
    // This middleware can be used for additional server-side protections
    // like checking cookies or implementing rate limiting.

    // Example: Block direct access to /admin without proper gateway verification
    // This is a basic protection layer - the actual auth check happens client-side
    if (pathname === '/admin' || pathname === '/admin/') {
        // Redirect /admin to home - use /adminaccess?key=... instead
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Block direct access to /admindashboard if no referrer from admin login
    // Note: This is a basic check - actual auth happens in the layout component
    if (pathname.startsWith('/admindashboard')) {
        const referer = request.headers.get('referer');
        const isFromAdminLogin = referer?.includes('/admin/login') || referer?.includes('/adminaccess');

        // Allow if coming from admin login page or already in admin dashboard
        if (!referer || (!isFromAdminLogin && !referer.includes('/admindashboard'))) {
            // On initial page load (no referer), let client-side handle it
            // The layout already redirects if not authenticated
        }
    }

    // Add security headers
    const response = NextResponse.next();

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
    ],
};
