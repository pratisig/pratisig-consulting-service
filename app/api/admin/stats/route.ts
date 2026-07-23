import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const [
    totalUsers,
    activeUsers,
    usersByRole,
    recentUsers,
    totalBiens,
    totalProduits,
    totalCommandes,
    totalLivraisons,
    totalTransactions,
    recentAuditLogs,
    usersThisMonth,
    usersLastMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    }),
    prisma.bienImmobilier.count(),
    prisma.produit.count(),
    prisma.commande.count(),
    prisma.livraison.count(),
    prisma.transaction.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  const roleDistribution = usersByRole.map(r => ({
    role: r.role,
    count: r._count,
  }));

  const growthRate = usersLastMonth > 0
    ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
    : usersThisMonth > 0 ? 100 : 0;

  return Response.json({
    totalUsers,
    activeUsers,
    roleDistribution,
    recentUsers,
    services: {
      immobilier: totalBiens,
      ecommerce: { produits: totalProduits, commandes: totalCommandes },
      livraison: totalLivraisons,
      transfert: totalTransactions,
    },
    recentActivity: recentAuditLogs,
    growth: {
      thisMonth: usersThisMonth,
      lastMonth: usersLastMonth,
      rate: growthRate,
    },
  });
}
