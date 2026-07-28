import { prisma } from '@/lib/db/prisma';

interface NotificationParams {
  userId: string;
  titre: string;
  message: string;
  type?: 'INFO' | 'COMMANDE' | 'LIVRAISON' | 'PROMO' | 'IMMOBILIER';
  lien?: string;
}

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification(params: NotificationParams) {
  const { userId, titre, message, type = 'INFO', lien } = params;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        titre,
        message,
        type,
        lien: lien || null,
      },
    });

    return {
      success: true,
      notification,
    };
  } catch (error) {
    console.error('Erreur création notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Notifie le propriétaire quand son bien est publié
 */
export async function notifyBienPublie(bienId: string, bienTitre: string, proprietaireId: string) {
  return createNotification({
    userId: proprietaireId,
    titre: 'Bien publié avec succès !',
    message: `Votre bien "${bienTitre}" a été publié et est maintenant visible par les acheteurs/locataires.`,
    type: 'IMMOBILIER',
    lien: `/immobilier/${bienId}`,
  });
}

/**
 * Notifie le propriétaire quand une demande de visite est reçue
 */
export async function notifyDemandeVisite(
  bienId: string,
  bienTitre: string,
  proprietaireId: string,
  clientNom: string
) {
  return createNotification({
    userId: proprietaireId,
    titre: 'Nouvelle demande de visite',
    message: `${clientNom} a demandé à visiter votre bien "${bienTitre}".`,
    type: 'IMMOBILIER',
    lien: `/dashboard/immobilier/${bienId}`,
  });
}

/**
 * Notifie le propriétaire quand une commission est créée
 */
export async function notifyCommission(
  proprietaireId: string,
  montant: number,
  transactionType: string
) {
  return createNotification({
    userId: proprietaireId,
    titre: 'Commission enregistrée',
    message: `Une commission de ${montant.toLocaleString('fr-FR')} FCFA a été enregistrée pour votre ${transactionType.toLowerCase()}.`,
    type: 'IMMOBILIER',
    lien: '/dashboard/mon-compte',
  });
}

/**
 * Compte les notifications non lues d'un utilisateur
 */
export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      lu: false,
    },
  });
}
