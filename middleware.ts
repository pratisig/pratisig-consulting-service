import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard and admin routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // Check for session cookie
    const session = request.cookies.get('pratisig_session');
    
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Validate session
    try {
      const data = JSON.parse(session.value);
      if (!data.userId) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // Check admin-only routes
      if (pathname.startsWith('/admin')) {
        if (!['SUPER_ADMIN', 'ADMIN'].includes(data.role)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      }
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
