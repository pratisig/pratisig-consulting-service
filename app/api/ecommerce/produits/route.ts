import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';

export async function GET() {
  try {
    const produits = await prisma.produit.findMany({
      where: { isActive: true },
      include: {
        categorie: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(produits);
  } catch (error) {
    console.error('Erreur GET produits:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { nom, slug, description, prix, prixPromo, stock, categorieId, images } = body;

    // Validation
    if (!nom || !prix) {
      return NextResponse.json({ error: 'Nom et prix requis' }, { status: 400 });
    }

    // Générer slug automatiquement si non fourni
    const slugGenere = slug || nom.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Vérifier si le slug existe déjà
    const existingProduit = await prisma.produit.findUnique({
      where: { slug: slugGenere },
    });

    if (existingProduit) {
      return NextResponse.json(
        { error: 'Un produit avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const produit = await prisma.produit.create({
      data: {
        nom,
        slug: slugGenere,
        description,
        prix: parseFloat(prix),
        prixPromo: prixPromo ? parseFloat(prixPromo) : null,
        stock: parseInt(stock) || 0,
        categorieId: categorieId || null,
        images: images || [],
        isActive: true,
      },
      include: {
        categorie: true,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'PRODUIT_CREATE',
      entity: 'Produit',
      entityId: produit.id,
      metadata: { nom, prix },
    });

    return NextResponse.json(produit, { status: 201 });
  } catch (error) {
    console.error('Erreur POST produit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    );
  }
}
