import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
}
