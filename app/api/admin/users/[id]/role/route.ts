import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import { logAudit } from '@/lib/security/audit';
import { z } from 'zod';

const schema = z.object({
  role: z.enum(['SUPER_ADMIN','ADMIN','SUPERVISEUR','AGENT','GERANT','CAISSIER','PROPRIETAIRE','LIVREUR','CLIENT']),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const adminUser = session.user as any;
  if (!hasPermission(adminUser.role, 'admin:users')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  // Empêcher de se modifier soi-même
  if (params.id === adminUser.id) return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre rôle' }, { status: 400 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });

  // Seul SUPER_ADMIN peut assigner ADMIN ou SUPER_ADMIN
  if (['ADMIN','SUPER_ADMIN'].includes(parsed.data.role) && adminUser.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Seul le Super Admin peut assigner ce rôle' }, { status: 403 });
  }

  const updated = await prisma.user.update({ where: { id: params.id }, data: { role: parsed.data.role } });
  await logAudit({ userId: adminUser.id, action: 'USER_ROLE_UPDATE', entity: 'User', entityId: params.id, metadata: { newRole: parsed.data.role } });
  return NextResponse.json({ success: true, role: updated.role });
}
