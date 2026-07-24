import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

import { logAudit } from '@/lib/security/audit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bien = await prisma.bienImmobilier.findUnique({
    where: { id },
    include: { proprietaire: { select: { name: true, phone: true, email: true } } },
  });
  if (!bien) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });
  return NextResponse.json(bien);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  

  const { id } = await params;
  const bien = await prisma.bienImmobilier.findUnique({ where: { id } });
  if (!bien) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 });

  const canEdit = ['SUPER_ADMIN','ADMIN','MANAGER_IMMOBILIER'].includes(user.role) || bien.proprietaireId === user.id;
  if (!canEdit) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.bienImmobilier.update({ where: { id }, data: body });
  await logAudit({ userId: user.id, action: 'BIEN_UPDATE', entity: 'BienImmobilier', entityId: id });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  if (!['SUPER_ADMIN','ADMIN','MANAGER_IMMOBILIER'].includes(user.role)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { id } = await params;
  await prisma.bienImmobilier.delete({ where: { id } });
  await logAudit({ userId: user.id, action: 'BIEN_DELETE', entity: 'BienImmobilier', entityId: id });
  return NextResponse.json({ success: true });
}
