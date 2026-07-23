import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { canManageRole } from '@/lib/auth/permissions';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') as Role | null;
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  
  // Non-admin users can't see SUPER_ADMIN
  if (currentUser.role === 'ADMIN') {
    where.role = { notIn: ['SUPER_ADMIN'] };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }
  if (role) where.role = role;
  if (status) where.status = status;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        image: true,
        lastLogin: true,
        createdAt: true,
        permissions: { select: { permission: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({
    users: users.map(u => ({
      ...u,
      extraPermissions: u.permissions.map(p => p.permission),
      permissions: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
