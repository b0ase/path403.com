import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const handle = request.cookies.get('hc_handle')?.value;
  const token = request.cookies.get('hc_token')?.value;

  if (handle && token) {
    return NextResponse.json({
      connected: true,
      provider: 'handcash',
      handle,
    });
  }

  return NextResponse.json({
    connected: false,
    provider: null,
    handle: null,
  });
}
