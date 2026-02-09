import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rewrite the root path
  if (pathname !== '/') return NextResponse.next();

  const host = request.headers.get('host') || '';

  if (host.includes('path401')) {
    return NextResponse.rewrite(new URL('/401', request.url));
  }

  if (host.includes('path403')) {
    return NextResponse.rewrite(new URL('/403', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
