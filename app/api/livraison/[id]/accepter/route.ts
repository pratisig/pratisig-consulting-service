import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;
  if (user.role !== 'LIVREUR') return NextResponse.json({ error: 'Réservé aux livreurs' }, { status: 403 });

  const livraison = await prisma.livraison.findUnique({ where: { id: params.id } });
  if (!livraison) return NextResponse.json({ error: 'Non trouvée' }, { status: 404 });
  if (livraison.statut !== 'EN_ATTENTE') return NextResponse.json({ error: 'Livraison déjà prise en charge' }, { status: 409 });

  const updated = await prisma.livraison.update({
    where: { id: params.id },
    data: { livreurId: user.id, statut: 'ACCEPTEE' },
  });

  await logAudit({ userId: user.id, action: 'LIVRAISON_ACCEPTER', entity: 'Livraison', entityId: params.id });
  return NextResponse.json(updated);
}
