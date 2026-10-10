import { NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req);
    return NextResponse.json({
      authenticated: auth.authenticated,
      role: auth.role,
    });
  } catch {
    return NextResponse.json({ authenticated: false, role: 'guest' });
  }
}
