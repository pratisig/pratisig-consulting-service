import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';
import { getErrorMessage } from '@/lib/utils/error';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  const produit = await prisma.produit.findUnique({
    where: { id },
    include: { categorie: true },
  });
  
  if (!produit) return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
  
  return NextResponse.json(produit);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  
  try {
    const body = await req.json();
    const { nom, description, prix, prixPromo, stock, isActive, categorieId } = body;
    
    const produit = await prisma.produit.update({
      where: { id },
      data: {
        nom,
        description,
        prix: parseFloat(prix),
        prixPromo: prixPromo ? parseFloat(prixPromo) : null,
        stock: parseInt(stock),
        isActive,
        categorieId: categorieId || null,
      },
    });
    
    await logAudit({
      userId: user.id,
      action: 'PRODUIT_UPDATE',
      entity: 'Produit',
      entityId: id,
      metadata: { nom, prix },
    });
    
    return NextResponse.json(produit);
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
  
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  
  try {
    await prisma.produit.update({
      where: { id },
      data: { isActive: false },
    });
    
    await logAudit({
      userId: user.id,
      action: 'PRODUIT_DELETE',
      entity: 'Produit',
      entityId: id,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
