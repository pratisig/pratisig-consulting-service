import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

import { logAudit } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  if (!['SUPER_ADMIN','ADMIN','MANAGER_ALIMENTATION','CAISSIER'].includes(user.role)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json();
  const { modePaiement, lignes } = body;

  if (!lignes || lignes.length === 0) return NextResponse.json({ error: 'Panier vide' }, { status: 400 });

  const total = lignes.reduce((s: number, l: any) => s + l.prixUnit * l.quantite, 0);

  const vente = await prisma.venteAlimentation.create({
    data: {
      caissierNodeId: user.id,
      total,
      modePaiement,
      statut: 'FERMEE',
      lignes: {
        create: lignes.map((l: any) => ({
          articleId: l.articleId,
          quantite: l.quantite,
          prixUnit: l.prixUnit,
          total: l.prixUnit * l.quantite,
        })),
      },
    },
    include: { lignes: true },
  });

  // Mettre à jour le stock
  await Promise.all(lignes.map((l: any) =>
    prisma.articleAlimentation.update({
      where: { id: l.articleId },
      data: { stock: { decrement: l.quantite } },
    })
  ));

  await logAudit({ userId: user.id, action: 'VENTE_CREATE', entity: 'VenteAlimentation', entityId: vente.id, metadata: { total } });
  return NextResponse.json(vente, { status: 201 });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  if (!['SUPER_ADMIN','ADMIN','MANAGER_ALIMENTATION','CAISSIER'].includes(user.role)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const ventes = await prisma.venteAlimentation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { lignes: { include: { article: true } } },
  });
  return NextResponse.json(ventes);
}
