import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, isValidSessionToken } from '@/lib/auth';
import { LEGACY_CATEGORY_KEYS } from '@/lib/catalog';

// Filter keys used by older versions of the shop (/boutique?categorie=…)
const LEGACY_FILTERS: Record<string, string> = {
  ...LEGACY_CATEGORY_KEYS,
  'attrape-reves': 'attrapes-reves',
  'decoration-murale': 'suspension-murale',
};

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Legacy filter URLs → dedicated, cacheable category pages (real 308 redirect)
  if (pathname === '/boutique' && searchParams.has('categorie')) {
    const key = searchParams.get('categorie') ?? '';
    const url = req.nextUrl.clone();
    url.search = '';
    if (key && key !== 'all') url.pathname = `/boutique/${LEGACY_FILTERS[key] ?? key}`;
    return NextResponse.redirect(url, 308);
  }

  // Already logged in → skip the login page
  if (pathname === '/admin') {
    if (await isValidSessionToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect /admin/dashboard and sub-routes, but NOT /admin (login) itself
  if (pathname.startsWith('/admin/')) {
    const session = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!(await isValidSessionToken(session))) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/boutique'],
};
