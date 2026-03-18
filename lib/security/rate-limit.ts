// Rate limiting simple basé sur Map (pour dev)
// En production, utiliser Upstash Redis

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true; // autorisé
  }

  if (record.count >= maxRequests) {
    return false; // bloqué
  }

  record.count++;
  return true;
}

// Nettoyer périodiquement la map (prévenir la fuite mémoire)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);
