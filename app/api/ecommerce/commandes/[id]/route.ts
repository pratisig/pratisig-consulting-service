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
  
  const commande = await prisma.commande.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, email: true, phone: true } },
      lignes: {
        include: { produit: { select: { nom: true, prix: true } } },
      },
    },
  });
  
  if (!commande) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
  
  // Vérifier que l'utilisateur est le client ou un admin
  if (commande.clientId !== user.id && !['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }
  
  return NextResponse.json(commande);
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
    const { statut } = body;
    
    const validStatuts = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];
    if (!validStatuts.includes(statut)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    
    const commande = await prisma.commande.update({
      where: { id },
      data: { statut },
    });
    
    await logAudit({
      userId: user.id,
      action: 'COMMANDE_UPDATE',
      entity: 'Commande',
      entityId: id,
      metadata: { oldStatut: commande.statut, newStatut: statut },
    });
    
    return NextResponse.json(commande);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
