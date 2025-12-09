import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login']

// Check if the path is an API route
function isApiRoute(path: string) {
    return path.startsWith('/api/')
}

// Check if the path is a static asset
function isStaticAsset(path: string) {
    return path.startsWith('/_next') ||
        path.startsWith('/favicon') ||
        path.includes('.')
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow static assets
    if (isStaticAsset(pathname)) {
        return NextResponse.next()
    }

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('crm_session')

    if (!sessionCookie?.value) {
        // Redirect to login for non-API routes
        if (!isApiRoute(pathname)) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Return 401 for API routes
        return NextResponse.json(
            { error: 'Não autenticado' },
            { status: 401 }
        )
    }

    // Validate session token (basic check)
    try {
        const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())

        if (sessionData.exp < Date.now()) {
            // Session expired
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('crm_session')
            return response
        }
    } catch {
        // Invalid token
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('crm_session')
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
