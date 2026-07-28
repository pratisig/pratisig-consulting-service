import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get('statut');
  const type = searchParams.get('type');

  try {
    const where: any = {};
    if (statut) where.statut = statut;
    if (type) where.transactionType = type;

    const commissions = await prisma.commission.findMany({
      where,
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
          },
        },
      },
      orderBy: {
        dateTransaction: 'desc',
      },
    });

    return NextResponse.json(commissions);
  } catch (error) {
    console.error('Erreur chargement commissions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      bienId,
      transactionType,
      montantBase,
      tauxCommission,
      proprietaireId,
      notes,
    } = body;

    if (!transactionType || !montantBase || !tauxCommission || !proprietaireId) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const montantCommission = (montantBase * tauxCommission) / 100;

    const commission = await prisma.commission.create({
      data: {
        bienId: bienId || null,
        transactionType,
        montantBase: parseFloat(montantBase),
        tauxCommission: parseFloat(tauxCommission),
        montantCommission,
        proprietaireId,
        notes: notes || null,
        statut: 'EN_ATTENTE',
      },
    });

    return NextResponse.json(commission, { status: 201 });
  } catch (error) {
    console.error('Erreur création commission:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
