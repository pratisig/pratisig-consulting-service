import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';
import { getErrorMessage } from '@/lib/utils/error';

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Seul le Super Admin peut supprimer' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type et ID requis' }, { status: 400 });
    }

    let deletedRecord;
    let auditAction;

    switch (type) {
      case 'bien':
        deletedRecord = await prisma.bienImmobilier.delete({ where: { id } });
        auditAction = 'BIEN_DELETE';
        break;

      case 'produit':
        deletedRecord = await prisma.produit.delete({ where: { id } });
        auditAction = 'PRODUIT_DELETE';
        break;

      case 'commande':
        // Supprimer les lignes de commande d'abord
        await prisma.ligneCommande.deleteMany({ where: { commandeId: id } });
        deletedRecord = await prisma.commande.delete({ where: { id } });
        auditAction = 'COMMANDE_DELETE';
        break;

      case 'livraison':
        deletedRecord = await prisma.livraison.delete({ where: { id } });
        auditAction = 'LIVRAISON_DELETE';
        break;

      case 'transaction':
        deletedRecord = await prisma.transaction.delete({ where: { id } });
        auditAction = 'TRANSACTION_DELETE';
        break;

      case 'article':
        deletedRecord = await prisma.articleAlimentation.delete({ where: { id } });
        auditAction = 'ARTICLE_DELETE';
        break;

      case 'vente':
        await prisma.ligneVente.deleteMany({ where: { venteId: id } });
        deletedRecord = await prisma.venteAlimentation.delete({ where: { id } });
        auditAction = 'VENTE_DELETE';
        break;

      default:
        return NextResponse.json({ error: 'Type non supporté' }, { status: 400 });
    }

    await logAudit({
      userId: user.id,
      action: auditAction,
      entity: type,
      entityId: id,
      metadata: { deletedRecord },
    });

    return NextResponse.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
