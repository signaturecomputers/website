import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/checkout', '/profile'];

// Admin routes that require admin access
const adminRoutes = ['/admindashboard', '/admin'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for deleted product HTTP 410 Gone handling
    if (pathname.startsWith('/product/')) {
        const productId = pathname.split('/product/')[1]?.split('?')[0];
        if (productId && !productId.includes('/')) {
            try {
                const res = await fetch(`https://firestore.googleapis.com/v1/projects/signature-40484/databases/(default)/documents/deleted_products/${productId}`);
                if (res.status === 200) {
                    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product No Longer Available | Signature Computers</title>
    <meta name="robots" content="noindex, nofollow">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background-color: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; color: #1f2937; }
        .card { max-width: 28rem; width: 100%; text-align: center; background-color: #ffffff; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); border: 1px solid #f3f4f6; }
        .badge { width: 4rem; height: 4rem; background-color: #fef3c7; color: #d97706; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; margin: 0 auto 1rem; }
        h1 { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem; }
        p { color: #4b5563; font-size: 0.875rem; margin: 0 0 1.5rem; line-height: 1.5; }
        a { display: inline-block; padding: 0.75rem 1.5rem; background-color: #2563eb; color: #ffffff; font-weight: 500; text-decoration: none; border-radius: 0.75rem; transition: background-color 0.2s; }
        a:hover { background-color: #1d4ed8; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">410</div>
        <h1>Product No Longer Available</h1>
        <p>This product has been discontinued or removed from our inventory and is no longer available.</p>
        <a href="/products">Browse All Products</a>
    </div>
</body>
</html>`;
                    return new NextResponse(html, {
                        status: 410,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                            'X-Robots-Tag': 'noindex, nofollow'
                        }
                    });
                }
            } catch (err) {
                console.error('Middleware 410 check error:', err);
            }
        }
    }

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
