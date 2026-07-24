import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getErrorMessage } from '@/lib/utils/error';

export async function GET() {
  try {
    const categories = await prisma.categorieEcommerce.findMany({
      orderBy: { nom: 'asc' },
      include: {
        parent: { select: { nom: true } },
        _count: { select: { produits: true } },
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur chargement catégories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { nom, slug, description, parentId } = body;

    if (!nom || !slug) {
      return NextResponse.json({ error: 'Nom et slug requis' }, { status: 400 });
    }

    // Vérifier si le slug existe déjà
    const existing = await prisma.categorieEcommerce.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: 'Cette catégorie existe déjà' }, { status: 400 });
    }

    const categorie = await prisma.categorieEcommerce.create({
      data: {
        nom,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(categorie, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
