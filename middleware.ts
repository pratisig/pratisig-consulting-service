import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes protégées et leurs rôles autorisés
const protectedRoutes: Record<string, string[]> = {
  '/dashboard': ['CLIENT', 'PROPRIETAIRE', 'LIVREUR', 'CAISSIER', 'GERANT', 'AGENT', 'SUPERVISEUR', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/immobilier': ['PROPRIETAIRE', 'GERANT', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/transfert': ['AGENT', 'SUPERVISEUR', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/alimentation': ['CAISSIER', 'GERANT', 'SUPERVISEUR', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/ecommerce': ['ADMIN', 'SUPER_ADMIN'],
  '/dashboard/livraison': ['LIVREUR', 'CLIENT', 'SUPERVISEUR', 'ADMIN', 'SUPER_ADMIN'],
  '/dashboard/admin': ['ADMIN', 'SUPER_ADMIN'],
};

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Redirect to login if accessing protected routes without session
  const isProtected = Object.keys(protectedRoutes).some(route =>
    pathname.startsWith(route)
  );

  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC: check role for specific routes
  if (session) {
    const userRole = (session.user as any)?.role;
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*'],
};
