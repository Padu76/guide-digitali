// E:\guide-digitali\src\app\api\admin\login\route.ts
// POST — Login admin con password

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Password non corretta' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('guide_admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 ore
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
