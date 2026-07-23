import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { AuditAction } from '@prisma/client';

export async function GET(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const action = searchParams.get('action') as AuditAction | null;
  const userId = searchParams.get('userId');
  const entity = searchParams.get('entity');

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (entity) where.entity = entity;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return Response.json({
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
