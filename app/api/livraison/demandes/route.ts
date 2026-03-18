import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { livraisonSchema } from '@/lib/validation/livraison';
import { rateLimit } from '@/lib/security/rate-limit';
import { logAudit } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
  const user = session.user as any;

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`livraison:${ip}`, 20, 3_600_000)) {
    return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = livraisonSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const prix = body.prix ?? 2000; // Prix par défaut, à calculer selon la zone

  const livraison = await prisma.livraison.create({
    data: { ...parsed.data, clientId: user.id, prix, statut: 'EN_ATTENTE' },
  });

  await logAudit({ userId: user.id, action: 'LIVRAISON_CREATE', entity: 'Livraison', entityId: livraison.id });
  return NextResponse.json(livraison, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;

  const where = user.role === 'LIVREUR' ? { statut: 'EN_ATTENTE' as const } :
    ['ADMIN','SUPER_ADMIN','SUPERVISEUR'].includes(user.role) ? {} :
    { clientId: user.id };

  const livraisons = await prisma.livraison.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { zone: true, client: { select: { name: true, phone: true } }, livreur: { select: { name: true, phone: true } } },
  });
  return NextResponse.json(livraisons);
}
