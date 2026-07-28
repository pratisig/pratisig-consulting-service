import { prisma } from '@/lib/db/prisma';

interface CreateCommissionParams {
  bienId?: string;
  transactionType: 'VENTE' | 'LOCATION';
  montantBase: number;
  tauxCommission: number;
  proprietaireId: string;
  notes?: string;
}

/**
 * Crée une commission automatiquement lors d'une vente ou location
 */
export async function createCommission(params: CreateCommissionParams) {
  const {
    bienId,
    transactionType,
    montantBase,
    tauxCommission,
    proprietaireId,
    notes,
  } = params;

  const montantCommission = (montantBase * tauxCommission) / 100;

  try {
    const commission = await prisma.commission.create({
      data: {
        bienId: bienId || null,
        transactionType,
        montantBase,
        tauxCommission,
        montantCommission,
        proprietaireId,
        notes: notes || `Commission automatique ${transactionType}`,
        statut: 'EN_ATTENTE',
      },
    });

    return {
      success: true,
      commission,
    };
  } catch (error) {
    console.error('Erreur création commission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Calcule et crée les commissions pour tous les biens vendus/loués sans commission
 */
export async function syncMissingCommissions(tauxVente = 5, tauxLocation = 10) {
  try {
    // Trouver les biens vendus sans commission
    const biensVendus = await prisma.bienImmobilier.findMany({
      where: {
        statut: 'VENDU',
        prixVente: { not: null },
        commissions: {
          none: {
            transactionType: 'VENTE',
          },
        },
      },
      select: {
        id: true,
        proprietaireId: true,
        prixVente: true,
        titre: true,
      },
    });

    // Trouver les biens loués sans commission
    const biensLoues = await prisma.bienImmobilier.findMany({
      where: {
        statut: 'LOUE',
        prixLoyer: { not: null },
        commissions: {
          none: {
            transactionType: 'LOCATION',
          },
        },
      },
      select: {
        id: true,
        proprietaireId: true,
        prixLoyer: true,
        titre: true,
      },
    });

    const results = {
      ventes: 0,
      locations: 0,
      erreurs: [] as string[],
    };

    // Créer les commissions pour les ventes
    for (const bien of biensVendus) {
      if (bien.prixVente) {
        const result = await createCommission({
          bienId: bien.id,
          transactionType: 'VENTE',
          montantBase: bien.prixVente,
          tauxCommission: tauxVente,
          proprietaireId: bien.proprietaireId,
          notes: `Commission vente automatique - ${bien.titre}`,
        });

        if (result.success) {
          results.ventes++;
        } else {
          results.erreurs.push(`Vente ${bien.id}: ${result.error}`);
        }
      }
    }

    // Créer les commissions pour les locations
    for (const bien of biensLoues) {
      if (bien.prixLoyer) {
        const result = await createCommission({
          bienId: bien.id,
          transactionType: 'LOCATION',
          montantBase: bien.prixLoyer,
          tauxCommission: tauxLocation,
          proprietaireId: bien.proprietaireId,
          notes: `Commission location automatique - ${bien.titre}`,
        });

        if (result.success) {
          results.locations++;
        } else {
          results.erreurs.push(`Location ${bien.id}: ${result.error}`);
        }
      }
    }

    return {
      success: true,
      ...results,
    };
  } catch (error) {
    console.error('Erreur sync commissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Taux de commission par défaut
 */
export const DEFAULT_TAUX = {
  VENTE: 5, // 5% pour les ventes
  LOCATION: 10, // 10% pour les locations (1 mois de loyer)
};
