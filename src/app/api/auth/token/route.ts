import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated', code: 'auth_error' }, { status: 401 });
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'No access token available', code: 'no_token' }, { status: 401 });
    }

    return NextResponse.json({ accessToken: token });
  } catch (error) {
    console.error('Token error:', error);

    return NextResponse.json({ error: 'Not authenticated', code: 'auth_error' }, { status: 401 });
  }
}
