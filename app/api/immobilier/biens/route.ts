import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import { logAudit } from '@/lib/security/audit';
import { z } from 'zod';

const bienSchema = z.object({
  titre: z.string().min(5).max(200),
  description: z.string().optional(),
  type: z.enum(['APPARTEMENT','VILLA','STUDIO','BUREAU','COMMERCE','TERRAIN','ENTREPOT']),
  prixLoyer: z.number().positive().optional(),
  prixVente: z.number().positive().optional(),
  surface: z.number().positive().optional(),
  nbChambres: z.number().int().min(0).optional(),
  nbSallesDeBain: z.number().int().min(0).optional(),
  adresse: z.string().min(5),
  quartier: z.string().optional(),
  ville: z.string().default('Dakar'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const ville = searchParams.get('ville');
  const quartier = searchParams.get('quartier');

  const biens = await prisma.bienImmobilier.findMany({
    where: {
      isActive: true,
      statut: 'DISPONIBLE',
      ...(type && { type: type as any }),
      ...(ville && { ville }),
      ...(quartier && { quartier }),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { proprietaire: { select: { name: true, phone: true } } },
  });
  return NextResponse.json(biens);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;
  if (!hasPermission(user.role, 'immobilier:publish')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json();
  const parsed = bienSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const bien = await prisma.bienImmobilier.create({
    data: { ...parsed.data, proprietaireId: user.id },
  });
  await logAudit({ userId: user.id, action: 'BIEN_CREATE', entity: 'BienImmobilier', entityId: bien.id });
  return NextResponse.json(bien, { status: 201 });
}
