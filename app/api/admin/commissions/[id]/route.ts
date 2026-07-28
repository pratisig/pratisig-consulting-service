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

  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { statut } = await req.json();

    if (!['EN_ATTENTE', 'PAYEE', 'ANNULEE'].includes(statut)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const updateData: any = { statut };
    if (statut === 'PAYEE') {
      updateData.datePaiement = new Date();
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Erreur mise à jour commission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const commission = await prisma.commission.findUnique({
      where: { id },
      include: {
        bien: {
          select: {
            titre: true,
            adresse: true,
          },
        },
        proprietaire: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!commission) {
      return NextResponse.json({ error: 'Commission non trouvée' }, { status: 404 });
    }

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Erreur chargement commission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
