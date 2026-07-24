/**
 * Extraire un message d'erreur lisible depuis n'importe quel type d'erreur
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.error === 'string') return e.error;
    if (typeof e.message === 'string') return e.message;
    if (typeof e.detail === 'string') return e.detail;
    // Si c'est un objet complexe, essayer de le sérialiser proprement
    try {
      const str = JSON.stringify(e);
      if (str && str !== '{}' && str !== 'null') return str;
    } catch {
      // ignore
    }
  }
  return 'Une erreur est survenue';
}

/**
 * Helper pour les appels API - lance une Error avec le bon message
 */
export async function handleApiResponse(res: Response): Promise<unknown> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.error === 'string' 
      ? data.error 
      : typeof data.message === 'string'
        ? data.message
        : `Erreur ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
