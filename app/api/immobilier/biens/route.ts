import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { bienImmobilierSchema } from '@/lib/validation/immobilier';
import { hasPermission } from '@/lib/auth/rbac';
import { logAudit } from '@/lib/security/audit';
import { rateLimit } from '@/lib/security/rate-limit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ville = searchParams.get('ville');
  const type = searchParams.get('type');
  const transaction = searchParams.get('transaction');

  const biens = await prisma.bienImmobilier.findMany({
    where: {
      isPublished: true,
      statut: 'DISPONIBLE',
      ...(ville ? { ville: { contains: ville, mode: 'insensitive' } } : {}),
      ...(type ? { type: type as any } : {}),
      ...(transaction ? { transactionType: transaction as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true, titre: true, type: true, transactionType: true,
      statut: true, prix: true, surface: true, nbChambres: true,
      ville: true, quartier: true, latitude: true, longitude: true,
      photos: true, createdAt: true,
    },
  });
  return NextResponse.json(biens);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;
  if (!hasPermission(user.role, 'immobilier:create')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`immobilier:create:${user.id}`, 20, 3_600_000)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = bienImmobilierSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const bien = await prisma.bienImmobilier.create({
    data: { ...parsed.data, proprietaireId: user.id, isPublished: false },
  });

  await logAudit({ userId: user.id, action: 'BIEN_CREATE', entity: 'BienImmobilier', entityId: bien.id });
  return NextResponse.json(bien, { status: 201 });
}
