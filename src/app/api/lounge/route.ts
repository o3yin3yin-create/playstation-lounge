import { NextResponse } from 'next/server';
import { centralStore } from '../../../lib/serverStore';
import { authenticateRequest } from '../../../lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req);
    await centralStore.ensureInitialized();
    const state = centralStore.getState(auth.role);

    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve state' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Enforce Server-Side Authorization: Only authenticated Admin or IT can update state!
    const auth = authenticateRequest(req);
    if (!auth.authenticated || (auth.role !== 'admin' && auth.role !== 'it')) {
      return NextResponse.json(
        { error: 'Unauthorized: Staff credentials required to perform state modifications.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await centralStore.ensureInitialized();
    // 2. Perform sanitized state update
    const updated = centralStore.updateState(body);
    return NextResponse.json({ success: true, state: centralStore.getState(auth.role) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}
