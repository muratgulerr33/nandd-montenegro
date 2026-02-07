import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

function getAllowedOrigins(): string[] {
  const explicit = process.env.CORS_ALLOWED_ORIGINS;
  if (explicit?.trim()) {
    return explicit.split(',').map((o) => o.trim()).filter(Boolean);
  }
  const origins: string[] = [];
  if (process.env.NEXT_PUBLIC_APP_URL) origins.push(process.env.NEXT_PUBLIC_APP_URL.trim());
  if (process.env.NEXT_PUBLIC_INBOX_URL) origins.push(process.env.NEXT_PUBLIC_INBOX_URL.trim());
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }
  return [...new Set(origins)];
}

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/chat/')) {
    const allowed = getAllowedOrigins();
    const origin = request.headers.get('origin') ?? '';
    const allowOrigin = allowed.length > 0 && origin && allowed.includes(origin) ? origin : null;
    if (request.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 204 });
      if (allowOrigin) res.headers.set('Access-Control-Allow-Origin', allowOrigin);
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');
      res.headers.set('Access-Control-Max-Age', '86400');
      return res;
    }
    const response = NextResponse.next();
    if (allowOrigin) response.headers.set('Access-Control-Allow-Origin', allowOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');
    return response;
  }
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!trpc|_next|_vercel|.*\\..*).*)']
};

