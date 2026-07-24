import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { getErrorMessage } from '@/lib/utils/error';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const categorie = await prisma.categorieEcommerce.update({
      where: { id },
      data: {
        nom,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(categorie);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Vérifier si la catégorie a des produits
    const produitsCount = await prisma.produit.count({
      where: { categorieId: id },
    });

    if (produitsCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie avec des produits' },
        { status: 400 }
      );
    }

    await prisma.categorieEcommerce.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
