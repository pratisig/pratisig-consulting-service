import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';

export async function GET() {
  try {
    const articles = await prisma.articleAlimentation.findMany({
      where: { isActive: true },
      include: {
        categorie: true,
      },
      orderBy: { nom: 'asc' },
    });

    return NextResponse.json(articles);
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
    const { nom, prix, stock, unite, categorieId } = body;

    if (!nom || !prix) {
      return NextResponse.json({ error: 'Nom et prix requis' }, { status: 400 });
    }

    // Valider le categorieId - doit être un UUID valide ou null
    let validCategorieId: string | null = null;
    if (categorieId) {
      // Vérifier que c'est un UUID valide (format standard)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(categorieId)) {
        // Vérifier que la catégorie existe
        const categorie = await prisma.categorieAlimentation.findUnique({
          where: { id: categorieId },
        });
        if (categorie) {
          validCategorieId = categorieId;
        }
      }
      // Si ce n'est pas un UUID valide, on ignore la catégorie
    }

    const article = await prisma.articleAlimentation.create({
      data: {
        nom,
        prix: parseFloat(prix),
        stock: parseInt(stock) || 0,
        unite: unite || 'unité',
        categorieId: validCategorieId,
        isActive: true,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'ARTICLE_CREATE' as any,
      entity: 'ArticleAlimentation',
      entityId: article.id,
      metadata: { nom, prix, stock },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
