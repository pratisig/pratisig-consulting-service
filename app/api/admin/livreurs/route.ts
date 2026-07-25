import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_LIVRAISON'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const livreurs = await prisma.user.findMany({
      where: {
        role: 'LIVREUR',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(livreurs);
  } catch (error) {
    console.error('Erreur chargement livreurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
