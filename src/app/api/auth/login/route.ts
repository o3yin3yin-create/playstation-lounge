import { NextResponse } from 'next/server';
import { centralStore } from '../../../../lib/serverStore';
import { 
  checkRateLimit, 
  recordFailedAttempt, 
  clearRateLimit, 
  createSessionToken, 
  getClientIp 
} from '../../../../lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many failed attempts. Security cooldown active. Please wait ${rateCheck.retryAfterSeconds} seconds.` 
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body || {};

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter your password.' },
        { status: 400 }
      );
    }

    await centralStore.ensureInitialized();
    const verification = centralStore.verifyPassword(password);

    if (!verification.valid || verification.role === 'guest') {
      recordFailedAttempt(ip);
      const remaining = rateCheck.remainingAttempts - 1;
      return NextResponse.json(
        { 
          success: false, 
          error: remaining > 0 
            ? `Incorrect password. ${remaining} attempt(s) remaining.` 
            : 'Incorrect password. Account temporarily locked for 2 minutes.' 
        },
        { status: 401 }
      );
    }

    // Success: clear rate limit and issue session token
    clearRateLimit(ip);
    const token = createSessionToken(verification.role);

    const response = NextResponse.json({
      success: true,
      role: verification.role,
      token,
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: 'clash_auth_token',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
