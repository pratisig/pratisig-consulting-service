import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { notifyLivraisonUpdate } from '@/lib/notifications';

const STATUTS_VALIDES = [
  'EN_ATTENTE',
  'ACCEPTEE',
  'EN_ROUTE_COLLECTE',
  'COLLECTE',
  'EN_ROUTE_LIVRAISON',
  'LIVREE',
  'ANNULEE'
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Vérifier les permissions
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_LIVRAISON', 'LIVREUR'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { statut } = body;

    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const livraison = await prisma.livraison.findUnique({
      where: { id },
    });

    if (!livraison) {
      return NextResponse.json({ error: 'Livraison non trouvée' }, { status: 404 });
    }

    // Vérifier les permissions spécifiques
    if (user.role === 'LIVREUR' && livraison.livreurId !== user.id) {
      return NextResponse.json({ error: 'Cette livraison ne vous est pas assignée' }, { status: 403 });
    }

    // Mettre à jour le statut
    const updated = await prisma.livraison.update({
      where: { id },
      data: { statut },
    });

    // Notifier le client
    if (statut !== 'EN_ATTENTE') {
      await notifyLivraisonUpdate(livraison.clientId, id, statut);
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LIVRAISON_UPDATE' as any,
        entity: 'Livraison',
        entityId: id,
        metadata: {
          ancienStatut: livraison.statut,
          nouveauStatut: statut,
        },
      },
    });

    return NextResponse.json({
      success: true,
      livraison: updated,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error: any) {
    console.error('Erreur mise à jour statut:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 });
  }
}
