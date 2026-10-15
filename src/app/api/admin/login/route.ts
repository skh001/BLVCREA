import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, computeSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  const token = await computeSessionToken();

  if (token && typeof password === 'string' && password.length > 0 && password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
  }

  // Slow down password guessing
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
}
