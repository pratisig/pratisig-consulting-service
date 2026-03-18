// Système de notifications léger basé sur Server-Sent Events
// En production, remplacer par Pusher ou Ably pour la scalabilité

export type NotificationEvent =
  | { type: 'NOUVELLE_COMMANDE'; commandeId: string; total: number }
  | { type: 'LIVRAISON_ACCEPTEE'; livraisonId: string; livreurNom: string }
  | { type: 'LIVRAISON_LIVREE'; livraisonId: string }
  | { type: 'NOUVELLE_TRANSACTION'; transactionId: string; service: string; montant: number }
  | { type: 'DEMANDE_VISITE'; bienId: string; nomClient: string };

// Store en mémoire des listeners SSE (pour dev, utiliser Redis pub/sub en prod)
const listeners = new Map<string, ReadableStreamDefaultController[]>();

export function addListener(userId: string, controller: ReadableStreamDefaultController) {
  const existing = listeners.get(userId) ?? [];
  listeners.set(userId, [...existing, controller]);
}

export function removeListener(userId: string, controller: ReadableStreamDefaultController) {
  const existing = listeners.get(userId) ?? [];
  listeners.set(userId, existing.filter(c => c !== controller));
}

export function notifyUser(userId: string, event: NotificationEvent) {
  const userListeners = listeners.get(userId) ?? [];
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const controller of userListeners) {
    try { controller.enqueue(new TextEncoder().encode(data)); } catch {}
  }
}

export function notifyRole(role: string, event: NotificationEvent, allUsers: { id: string; role: string }[]) {
  const targets = allUsers.filter(u => u.role === role);
  targets.forEach(u => notifyUser(u.id, event));
}
