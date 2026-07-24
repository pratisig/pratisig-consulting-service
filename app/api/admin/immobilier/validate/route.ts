import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Récupérer les biens en attente de validation
  const pendingBiens = await prisma.bienImmobilier.findMany({
    where: { isPublished: false },
    orderBy: { createdAt: 'desc' },
    include: {
      proprietaire: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsapp: true,
        },
      },
    },
  });

  // Stats de validation
  const [totalPending, totalPublished, totalActive] = await Promise.all([
    prisma.bienImmobilier.count({ where: { isPublished: false } }),
    prisma.bienImmobilier.count({ where: { isPublished: true, isActive: true } }),
    prisma.bienImmobilier.count({ where: { isActive: true } }),
  ]);

  return NextResponse.json({
    pending: pendingBiens,
    stats: { totalPending, totalPublished, totalActive },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { bienId, action, reason } = body;

    if (!bienId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const bien = await prisma.bienImmobilier.findUnique({
      where: { id: bienId },
    });

    if (!bien) {
      return NextResponse.json({ error: 'Bien non trouvé' }, { status: 404 });
    }

    if (action === 'approve') {
      await prisma.bienImmobilier.update({
        where: { id: bienId },
        data: { isPublished: true, isActive: true },
      });

      await logAudit({
        userId: user.id,
        action: 'BIEN_PUBLISH',
        entity: 'BienImmobilier',
        entityId: bienId,
      });

      return NextResponse.json({ message: 'Bien approuvé et publié' });
    }

    if (action === 'reject') {
      await prisma.bienImmobilier.update({
        where: { id: bienId },
        data: { isActive: false },
      });

      await logAudit({
        userId: user.id,
        action: 'BIEN_DELETE',
        entity: 'BienImmobilier',
        entityId: bienId,
        metadata: { reason, action: 'reject' },
      });

      return NextResponse.json({ message: 'Bien rejeté', reason });
    }
  } catch (error) {
    console.error('Erreur validation bien:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
