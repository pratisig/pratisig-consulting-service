import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { createCommission, DEFAULT_TAUX } from '@/lib/utils/commissions';
import { notifyBienPublie, notifyCommission } from '@/lib/notifications/notify';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { isPublished, statut } = body;

    const updateData: any = {};
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (statut) updateData.statut = statut;

    const bien = await prisma.bienImmobilier.update({
      where: { id },
      data: updateData,
    });

    // Créer automatiquement une commission si le bien est vendu ou loué
    if (statut === 'VENDU' && bien.prixVente) {
      const commissionResult = await createCommission({
        bienId: bien.id,
        transactionType: 'VENTE',
        montantBase: bien.prixVente,
        tauxCommission: DEFAULT_TAUX.VENTE,
        proprietaireId: bien.proprietaireId,
        notes: `Commission auto - Vente: ${bien.titre}`,
      });

      // Notifier le propriétaire
      if (commissionResult.success && commissionResult.commission) {
        await notifyCommission(
          bien.proprietaireId,
          commissionResult.commission.montantCommission,
          'VENTE'
        );
      }
    }

    if (statut === 'LOUE' && bien.prixLoyer) {
      const commissionResult = await createCommission({
        bienId: bien.id,
        transactionType: 'LOCATION',
        montantBase: bien.prixLoyer,
        tauxCommission: DEFAULT_TAUX.LOCATION,
        proprietaireId: bien.proprietaireId,
        notes: `Commission auto - Location: ${bien.titre}`,
      });

      // Notifier le propriétaire
      if (commissionResult.success && commissionResult.commission) {
        await notifyCommission(
          bien.proprietaireId,
          commissionResult.commission.montantCommission,
          'LOCATION'
        );
      }
    }

    // Notification quand le bien est publié (première publication)
    if (isPublished === true) {
      await notifyBienPublie(bien.id, bien.titre, bien.proprietaireId);
    }

    return NextResponse.json({
      success: true,
      bien: {
        id: bien.id,
        titre: bien.titre,
        isPublished: bien.isPublished,
        statut: bien.statut,
      },
    });
  } catch (error) {
    console.error('Erreur publication:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
