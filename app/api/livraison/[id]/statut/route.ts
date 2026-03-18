import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { logAudit } from '@/lib/security/audit';
import { z } from 'zod';

const statutSchema = z.object({
  statut: z.enum(['EN_ROUTE_COLLECTE','COLLECTE','EN_ROUTE_LIVRAISON','LIVREE','ANNULEE']),
  livreurLat: z.number().optional(),
  livreurLng: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;

  const body = await req.json();
  const parsed = statutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const livraison = await prisma.livraison.findUnique({ where: { id: params.id } });
  if (!livraison) return NextResponse.json({ error: 'Non trouvée' }, { status: 404 });

  const canUpdate = livraison.livreurId === user.id || ['ADMIN','SUPER_ADMIN','SUPERVISEUR'].includes(user.role);
  if (!canUpdate) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const updated = await prisma.livraison.update({
    where: { id: params.id },
    data: { statut: parsed.data.statut, livreurLat: parsed.data.livreurLat, livreurLng: parsed.data.livreurLng },
  });

  await logAudit({ userId: user.id, action: `LIVRAISON_${parsed.data.statut}`, entity: 'Livraison', entityId: params.id });
  return NextResponse.json(updated);
}
