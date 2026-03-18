import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limit';

const visiteSchema = z.object({
  nomClient: z.string().min(2).max(100),
  telClient: z.string().min(8).max(20),
  emailClient: z.string().email().optional(),
  message: z.string().max(500).optional(),
  dateVisite: z.string().datetime().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`visite:${ip}`, 5, 3_600_000)) {
    return NextResponse.json({ error: 'Trop de demandes' }, { status: 429 });
  }

  const bien = await prisma.bienImmobilier.findUnique({ where: { id: params.id } });
  if (!bien || !bien.isActive) return NextResponse.json({ error: 'Bien introuvable' }, { status: 404 });

  const body = await req.json();
  const parsed = visiteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const visite = await prisma.demandeVisite.create({
    data: { bienId: params.id, ...parsed.data },
  });
  return NextResponse.json({ success: true, id: visite.id }, { status: 201 });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const visites = await prisma.demandeVisite.findMany({
    where: { bienId: params.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(visites);
}
