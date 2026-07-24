import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  if (user.role !== 'LIVREUR') return NextResponse.json({ error: 'Réservé aux livreurs' }, { status: 403 });

  const { id } = await params;
  const livraison = await prisma.livraison.findUnique({ where: { id } });
  if (!livraison) return NextResponse.json({ error: 'Non trouvée' }, { status: 404 });
  if (livraison.statut !== 'EN_ATTENTE') return NextResponse.json({ error: 'Livraison déjà prise en charge' }, { status: 409 });

  const updated = await prisma.livraison.update({
    where: { id },
    data: { livreurId: user.id, statut: 'ACCEPTEE' },
  });

  await logAudit({ userId: user.id, action: 'LIVRAISON_ACCEPTER', entity: 'Livraison', entityId: id });
  return NextResponse.json(updated);
}
