import { NextResponse } from 'next/server';
import { centralStore } from '../../../../lib/serverStore';
import { authenticateRequest, createSessionToken } from '../../../../lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req);

    // Only IT Master is authorized to update credentials
    if (!auth.authenticated || auth.role !== 'it') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only IT Master is authorized to modify system passwords.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { target, newPassword } = body || {};

    if (target !== 'admin' && target !== 'it') {
      return NextResponse.json(
        { success: false, error: 'Invalid target. Must be "admin" or "it".' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    await centralStore.ensureInitialized();
    const updated = centralStore.updatePassword(target, newPassword.trim());

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password.' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `${target === 'admin' ? 'Admin' : 'IT'} password updated successfully.`,
    });

    // Refresh token if IT changed their own password
    if (target === 'it') {
      const newToken = createSessionToken('it');
      response.cookies.set({
        name: 'clash_auth_token',
        value: newToken,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error while updating password.' },
      { status: 500 }
    );
  }
}
