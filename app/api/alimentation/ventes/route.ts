import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';

export async function GET() {
  try {
    const ventes = await prisma.venteAlimentation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        caissier: { select: { name: true, email: true } },
        lignes: {
          include: {
            article: { select: { nom: true, prix: true } },
          },
        },
      },
    });

    return NextResponse.json(ventes);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_ALIMENTATION', 'CAISSIER'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { lignes, modePaiement } = body;

    if (!lignes || !Array.isArray(lignes) || lignes.length === 0) {
      return NextResponse.json({ error: 'Au moins un article requis' }, { status: 400 });
    }

    // Calculer le total
    let total = 0;
    for (const ligne of lignes) {
      const article = await prisma.articleAlimentation.findUnique({
        where: { id: ligne.articleId },
      });
      
      if (!article || !article.isActive) {
        return NextResponse.json({ error: `Article ${ligne.articleId} non disponible` }, { status: 400 });
      }
      
      if (article.stock < ligne.quantite) {
        return NextResponse.json({ error: `Stock insuffisant pour ${article.nom}` }, { status: 400 });
      }
      
      total += article.prix * ligne.quantite;
    }

    // Créer la vente
    const vente = await prisma.venteAlimentation.create({
      data: {
        total,
        modePaiement: modePaiement || 'ESPECES',
        caissierNodeId: user.id,
        lignes: {
          create: lignes.map((ligne: any) => ({
            articleId: ligne.articleId,
            quantite: ligne.quantite,
            prixUnit: ligne.prixUnit,
            total: ligne.prixUnit * ligne.quantite,
          })),
        },
      },
      include: {
        lignes: {
          include: { article: true },
        },
      },
    });

    // Mettre à jour les stocks
    for (const ligne of lignes) {
      await prisma.articleAlimentation.update({
        where: { id: ligne.articleId },
        data: {
          stock: { decrement: ligne.quantite },
        },
      });
    }

    await logAudit({
      userId: user.id,
      action: 'VENTE_CREATE' as any,
      entity: 'VenteAlimentation',
      entityId: vente.id,
      metadata: { total, modePaiement, nbArticles: lignes.length },
    });

    return NextResponse.json(vente, { status: 201 });
  } catch (error) {
    console.error('Erreur création vente:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
