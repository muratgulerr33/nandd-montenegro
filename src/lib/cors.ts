import { NextResponse } from 'next/server';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.23:3000',
];

export function getAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? '';
  const trimmed = raw.trim();
  const extra = trimmed
    ? trimmed.split(',').map((o) => o.trim()).filter((o) => o.length > 0)
    : [];
  return [...new Set([...DEFAULT_ORIGINS, ...extra])];
}

function getAllowOrigin(request: Request): string | null {
  const origin = request.headers.get('origin') ?? '';
  const allowed = getAllowedOrigins();
  return origin && allowed.includes(origin) ? origin : null;
}

const CORS_METHODS = 'GET, POST, OPTIONS';
const CORS_HEADERS = 'Content-Type, x-admin-secret';

export function withCorsHeaders(response: NextResponse, request: Request): NextResponse {
  const allowOrigin = getAllowOrigin(request);
  if (allowOrigin) response.headers.set('Access-Control-Allow-Origin', allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', CORS_METHODS);
  response.headers.set('Access-Control-Allow-Headers', CORS_HEADERS);
  return response;
}

export function corsOptionsResponse(request: Request): NextResponse {
  const res = new NextResponse(null, { status: 204 });
  const allowOrigin = getAllowOrigin(request);
  if (allowOrigin) res.headers.set('Access-Control-Allow-Origin', allowOrigin);
  res.headers.set('Access-Control-Allow-Methods', CORS_METHODS);
  res.headers.set('Access-Control-Allow-Headers', CORS_HEADERS);
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}
