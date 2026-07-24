import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Fetch records from all services
    const [biens, produits, commandes, livraisons, transactions, articles] = await Promise.all([
      prisma.bienImmobilier.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.produit.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.commande.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          lignes: {
            include: { produit: true },
          },
        },
      }),
      prisma.livraison.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.articleAlimentation.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Transform records into unified format
    const records = [
      ...biens.map(b => ({
        id: b.id,
        type: 'bien',
        title: b.titre,
        description: b.description || 'Aucune description',
        date: b.createdAt,
        status: b.statut,
        price: b.prixLoyer || b.prixVente,
      })),
      ...produits.map(p => ({
        id: p.id,
        type: 'produit',
        title: p.nom,
        description: p.description || 'Aucune description',
        date: p.createdAt,
        price: p.prix,
      })),
      ...commandes.map(c => ({
        id: c.id,
        type: 'commande',
        title: `Commande #${c.id.slice(0, 8)}`,
        description: `${c.lignes.length} article(s) - ${c.adresseLivraison}`,
        date: c.createdAt,
        status: c.statut,
        price: c.total,
      })),
      ...livraisons.map(l => ({
        id: l.id,
        type: 'livraison',
        title: `Livraison #${l.id.slice(0, 8)}`,
        description: `${l.adresseCollecte} → ${l.adresseDest}`,
        date: l.createdAt,
        status: l.statut,
        price: l.prix,
      })),
      ...transactions.map(t => ({
        id: t.id,
        type: 'transaction',
        title: `${t.type} - ${t.service}`,
        description: `Client: ${t.clientNom || 'N/A'} - ${t.clientPhone}`,
        date: t.createdAt,
        status: t.statut,
        price: t.montant,
      })),
      ...articles.map(a => ({
        id: a.id,
        type: 'article',
        title: a.nom,
        description: `Stock: ${a.stock} ${a.unite}`,
        date: a.createdAt,
        price: a.prix,
      })),
    ];

    // Sort by date descending
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error: any) {
    console.error('Error fetching records:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erreur lors de la récupération des enregistrements' 
    }, { status: 500 });
  }
}
