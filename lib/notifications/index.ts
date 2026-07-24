import { prisma } from '@/lib/db/prisma';

export type NotificationType = 'INFO' | 'COMMANDE' | 'LIVRAISON' | 'PROMO';

export async function createNotification(
  userId: string,
  titre: string,
  message: string,
  type: NotificationType = 'INFO',
  lien?: string
) {
  try {
    await prisma.$executeRaw`
      INSERT INTO "Notification" ("userId", titre, message, type, lien)
      VALUES (${userId}, ${titre}, ${message}, ${type}, ${lien || null})
    `;
    return true;
  } catch (error) {
    console.error('Erreur création notification:', error);
    return false;
  }
}

export async function notifyNewCommande(
  clientId: string,
  commandeId: string,
  montant: number
) {
  return createNotification(
    clientId,
    'Commande confirmée',
    `Votre commande de ${montant.toLocaleString('fr-FR')} FCFA a été enregistrée.`,
    'COMMANDE',
    `/dashboard/ecommerce/commandes/${commandeId}`
  );
}

export async function notifyLivraisonUpdate(
  clientId: string,
  livraisonId: string,
  statut: string
) {
  const messages: Record<string, string> = {
    ACCEPTEE: 'Un livreur a accepté votre livraison.',
    EN_ROUTE_COLLECTE: 'Le livreur est en route pour récupérer le colis.',
    COLLECTE: 'Le colis a été récupéré.',
    EN_ROUTE_LIVRAISON: 'Le livreur est en route vers la destination.',
    LIVREE: 'Votre livraison a été effectuée !',
  };

  return createNotification(
    clientId,
    'Mise à jour livraison',
    messages[statut] || 'Statut de livraison mis à jour.',
    'LIVRAISON',
    `/dashboard/livraison/${livraisonId}`
  );
}

export async function notifyPromo(userId: string, code: string, reduction: number) {
  return createNotification(
    userId,
    'Nouvelle promotion !',
    `Utilisez le code ${code} pour obtenir ${reduction}% de réduction.`,
    'PROMO',
    '/boutique'
  );
}

export async function notifyBienValidated(
  proprietaireId: string,
  bienId: string,
  bienTitre: string
) {
  return createNotification(
    proprietaireId,
    'Bien publié',
    `Votre bien "${bienTitre}" a été validé et est maintenant visible.`,
    'INFO',
    `/immobilier/${bienId}`
  );
}
