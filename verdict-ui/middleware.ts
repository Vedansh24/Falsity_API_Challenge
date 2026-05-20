import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_NAMES, getRoleHomePath, ROLE_ROUTE_REQUIREMENTS, type Role, hasAtLeastRole } from './src/config/roles';

const AUTH_PATHS = ['/login', '/signup'];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function findRouteRequirement(pathname: string) {
  return ROLE_ROUTE_REQUIREMENTS.find((route) => pathname.startsWith(route.prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const role = request.cookies.get(AUTH_COOKIE_NAMES.ROLE)?.value as Role | undefined;
  const isAuthenticated = Boolean(accessToken);

  if (isAuthPath(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(getRoleHomePath(role ?? 'USER'), request.url));
    }

    return NextResponse.next();
  }

  const requirement = findRouteRequirement(pathname);
  if (!requirement) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (!role && pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (!hasAtLeastRole(role, requirement.minimumRole)) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard', '/dashboard/:path*', '/analyst', '/analyst/:path*', '/reviewer', '/reviewer/:path*', '/admin', '/admin/:path*']
};
