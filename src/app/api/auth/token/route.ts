import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { token } = await auth0.getAccessToken();
    if (!token) {
      return NextResponse.json({ error: 'No access token available', code: 'no_token' }, { status: 401 });
    }
    return NextResponse.json({ accessToken: token });
  } catch (error) {
    console.error('Token error:', error);

    // Check if it's a refresh token error - user needs to re-authenticate
    const errorObj = error as { code?: string };
    if (errorObj.code === 'missing_refresh_token' || errorObj.code === 'invalid_grant') {
      return NextResponse.json({
        error: 'Session expired. Please log in again.',
        code: 'session_expired',
        requiresReauth: true
      }, { status: 401 });
    }

    return NextResponse.json({ error: 'Not authenticated', code: 'auth_error' }, { status: 401 });
  }
}
