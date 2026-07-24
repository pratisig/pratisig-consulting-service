import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { transactionSchema } from '@/lib/validation/transfert';

import { logAudit } from '@/lib/security/audit';
import { rateLimit } from '@/lib/security/rate-limit';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  if (!['SUPER_ADMIN','ADMIN','MANAGER_TRANSFERT','AGENT'].includes(user.role)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const perPage = 20;

  const where = ['SUPER_ADMIN','ADMIN','MANAGER_TRANSFERT'].includes(user.role) ? {} : { agentId: user.id };

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
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  if (!['SUPER_ADMIN','ADMIN','MANAGER_TRANSFERT','AGENT'].includes(user.role)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

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
