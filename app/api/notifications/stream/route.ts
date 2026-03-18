import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { addListener, removeListener } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new Response('Non authentifié', { status: 401 });
  const user = session.user as any;

  const stream = new ReadableStream({
    start(controller) {
      // Envoyer un ping initial
      controller.enqueue(new TextEncoder().encode('data: {"type":"CONNECTED"}\n\n'));
      addListener(user.id, controller);

      // Ping toutes les 30s pour maintenir la connexion
      const pingInterval = setInterval(() => {
        try { controller.enqueue(new TextEncoder().encode(': ping\n\n')); } catch { clearInterval(pingInterval); }
      }, 30_000);

      req.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        removeListener(user.id, controller);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
