import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import { logAudit } from '@/lib/security/audit';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const bien = await prisma.bienImmobilier.findUnique({
    where: { id: params.id },
    include: { proprietaire: { select: { name: true, phone: true, email: true } } },
  });
  if (!bien) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  return NextResponse.json(bien);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;

  const bien = await prisma.bienImmobilier.findUnique({ where: { id: params.id } });
  if (!bien) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });

  const canEdit = hasPermission(user.role, 'immobilier:manage') || bien.proprietaireId === user.id;
  if (!canEdit) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.bienImmobilier.update({ where: { id: params.id }, data: body });
  await logAudit({ userId: user.id, action: 'BIEN_UPDATE', entity: 'BienImmobilier', entityId: params.id });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;
  if (!hasPermission(user.role, 'immobilier:manage')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  await prisma.bienImmobilier.delete({ where: { id: params.id } });
  await logAudit({ userId: user.id, action: 'BIEN_DELETE', entity: 'BienImmobilier', entityId: params.id });
  return NextResponse.json({ success: true });
}
