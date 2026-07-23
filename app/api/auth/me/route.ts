import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      phone: true,
      permissions: { select: { permission: true } },
    },
  });

  if (!user) return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

  return Response.json({
    user: {
      ...user,
      permissions: user.permissions.map(p => p.permission),
    },
  });
}
