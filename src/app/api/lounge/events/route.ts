import { centralStore, LoungeServerState } from '../../../../lib/serverStore';
import { authenticateRequest } from '../../../../lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const auth = authenticateRequest(req);

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send immediate sanitized state upon connection (Passwords stripped for guests)
      const currentState = centralStore.getState(auth.role);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(currentState)}\n\n`));

      // 2. Subscribe to store changes (Emits sanitized state)
      const unsubscribe = centralStore.subscribe((newState: LoungeServerState) => {
        try {
          // Deliver state sanitized according to the connection's verified role
          const safeState = {
            ...newState,
            auth: {
              adminPassword: auth.role === 'it' ? newState.auth.adminPassword : '',
              itPassword: auth.role === 'it' ? newState.auth.itPassword : '',
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(safeState)}\n\n`));
        } catch {
          // Stream closed
        }
      });

      // 3. Keepalive heartbeat every 20 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 20000);

      // 4. Cleanup on abort
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
