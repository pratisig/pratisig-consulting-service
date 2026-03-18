import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { transactionSchema } from '@/lib/validation/transfert';
import { hasPermission } from '@/lib/auth/rbac';
import { logAudit } from '@/lib/security/audit';
import { rateLimit } from '@/lib/security/rate-limit';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;
  if (!hasPermission(user.role, 'transfert:operate')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const perPage = 20;

  const where = hasPermission(user.role, 'transfert:supervise') ? {} : { agentId: user.id };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { agent: { select: { name: true } } },
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({ transactions, total, page, pages: Math.ceil(total / perPage) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;
  if (!hasPermission(user.role, 'transfert:operate')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`transfert:${user.id}`, 100, 3_600_000)) {
    return NextResponse.json({ error: 'Limite d\'opérations atteinte' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const transaction = await prisma.transaction.create({
    data: { ...parsed.data, agentId: user.id, statut: 'SUCCES' },
  });

  await logAudit({
    userId: user.id, action: 'TRANSACTION_CREATE',
    entity: 'Transaction', entityId: transaction.id,
    metadata: { service: parsed.data.service, montant: parsed.data.montant, type: parsed.data.type },
  });

  return NextResponse.json(transaction, { status: 201 });
}
