import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { token } = await auth0.getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }
    return NextResponse.json({ accessToken: token });
  } catch (error) {
    console.error('Token error:', error);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}
