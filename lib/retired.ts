import { NextResponse } from 'next/server';

/** 410 for every retired route (18 Nov 2026 security retirement). Takes no input and touches nothing. */
export function retired(): NextResponse {
  return NextResponse.json(
    { error: 'This endpoint is retired.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
