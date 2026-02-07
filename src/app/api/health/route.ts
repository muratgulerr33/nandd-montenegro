import { NextResponse } from 'next/server';

export async function GET() {
  const ts = new Date().toISOString();
  return NextResponse.json({ ok: true, ts }, { status: 200 });
}
