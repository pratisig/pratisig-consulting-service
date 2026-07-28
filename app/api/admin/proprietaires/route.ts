import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Récupérer tous les propriétaires (PENDING et ACTIVE)
    const proprietaires = await prisma.user.findMany({
      where: {
        role: 'PROPRIETAIRE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(proprietaires);
  } catch (error) {
    console.error('Erreur chargement propriétaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
