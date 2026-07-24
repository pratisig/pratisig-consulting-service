import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Récupérer les données pour les graphiques
    const [
      totalRevenue,
      totalCommandes,
      totalVentesAlim,
      totalProduits,
      commandesStatut,
      produitsCategorie,
      revenueData,
      topProduits,
    ] = await Promise.all([
      // CA total (commandes livrées + ventes alimentation)
      prisma.commande.aggregate({
        _sum: { total: true },
        where: { statut: 'LIVREE' },
      }).then(r => r._sum.total || 0),
      
      // Nombre total de commandes
      prisma.commande.count(),
      
      // Nombre total de ventes alimentation
      prisma.venteAlimentation.count(),
      
      // Nombre de produits actifs
      prisma.produit.count({ where: { isActive: true } }),
      
      // Commandes par statut
      prisma.commande.groupBy({
        by: ['statut'],
        _count: { id: true },
      }).then(r => r.map(x => ({ name: x.statut, value: x._count.id }))),
      
      // Produits par catégorie
      prisma.produit.groupBy({
        by: ['categorieId'],
        _count: { id: true },
      }).then(async (r) => {
        const result = [];
        for (const item of r) {
          const cat = item.categorieId 
            ? await prisma.categorieEcommerce.findUnique({ where: { id: item.categorieId } })
            : null;
          result.push({
            name: cat?.nom || 'Sans catégorie',
            count: item._count.id,
          });
        }
        return result;
      }),
      
      // Revenue sur les 7 derniers jours
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          return prisma.commande.aggregate({
            _sum: { total: true },
            where: {
              statut: 'LIVREE',
              createdAt: { gte: date, lt: nextDate },
            },
          }).then(r => ({
            date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            revenue: r._sum.total || 0,
          }));
        })
      ),
      
      // Top 10 produits vendus
      prisma.ligneCommande.groupBy({
        by: ['produitId'],
        _sum: { quantite: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }).then(async (r) => {
        const result = [];
        for (const item of r) {
          const produit = await prisma.produit.findUnique({
            where: { id: item.produitId },
            include: { categorie: true },
          });
          if (produit) {
            result.push({
              id: produit.id,
              nom: produit.nom,
              categorie: produit.categorie?.nom || 'N/A',
              quantiteVendue: item._sum.quantite || 0,
              totalVendu: item._sum.total || 0,
            });
          }
        }
        return result;
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalCommandes,
        totalVentesAlim,
        totalProduits,
        commandesStatut,
        produitsCategorie,
        revenueData,
        topProduits,
      },
    });
  } catch (error) {
    console.error('Erreur analytics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la récupération des statistiques' 
    }, { status: 500 });
  }
}
