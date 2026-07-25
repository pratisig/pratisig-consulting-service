import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_LIVRAISON'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { livreurId } = body;

    if (!livreurId) {
      return NextResponse.json({ error: 'ID du livreur requis' }, { status: 400 });
    }

    // Vérifier que le livreur existe et a le bon rôle
    const livreur = await prisma.user.findUnique({
      where: { id: livreurId },
    });

    if (!livreur || livreur.role !== 'LIVREUR') {
      return NextResponse.json({ error: 'Livreur invalide' }, { status: 400 });
    }

    // Mettre à jour la livraison avec le livreur assigné
    const livraison = await prisma.livraison.update({
      where: { id },
      data: {
        livreurId: livreurId,
        statut: 'ACCEPTEE',
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LIVRAISON_ASSIGN' as any,
        entity: 'Livraison',
        entityId: id,
        metadata: {
          livreurId,
          livreurName: livreur.name || livreur.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      livraison,
      message: 'Livreur assigné avec succès'
    });
  } catch (error: any) {
    console.error('Erreur assignation livreur:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 });
  }
}
