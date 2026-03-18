import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import { logAudit } from '@/lib/security/audit';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const adminUser = session.user as any;
  if (!hasPermission(adminUser.role, 'admin:users')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  if (params.id === adminUser.id) return NextResponse.json({ error: 'Impossible de vous bannir vous-même' }, { status: 400 });

  await prisma.user.update({ where: { id: params.id }, data: { status: 'BANNED' } });
  await logAudit({ userId: adminUser.id, action: 'USER_BAN', entity: 'User', entityId: params.id });
  return NextResponse.redirect(new URL('/dashboard/admin/utilisateurs', _req.url));
}
