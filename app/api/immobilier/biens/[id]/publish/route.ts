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

  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const { isPublished } = await req.json();

    const bien = await prisma.bienImmobilier.update({
      where: { id },
      data: { isPublished },
    });

    return NextResponse.json({
      success: true,
      bien: {
        id: bien.id,
        titre: bien.titre,
        isPublished: bien.isPublished,
      },
    });
  } catch (error) {
    console.error('Erreur publication:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
