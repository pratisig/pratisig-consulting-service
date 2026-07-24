import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';
import { getErrorMessage } from '@/lib/utils/error';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Seul le Super Admin peut supprimer' }, { status: 403 });
  }

  try {
    await prisma.bienImmobilier.delete({
      where: { id },
    });

    await logAudit({
      userId: user.id,
      action: 'BIEN_DELETE',
      entity: 'BienImmobilier',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();

    const bien = await prisma.bienImmobilier.update({
      where: { id },
      data: body,
    });

    await logAudit({
      userId: user.id,
      action: 'BIEN_UPDATE',
      entity: 'BienImmobilier',
      entityId: id,
      metadata: body,
    });

    return NextResponse.json(bien);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
