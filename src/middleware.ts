import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/dashboard and sub-routes, but NOT /admin (login) itself
  if (pathname.startsWith('/admin/') || pathname === '/admin/dashboard') {
    const session = req.cookies.get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
