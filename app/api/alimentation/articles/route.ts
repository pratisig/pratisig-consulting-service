import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';

export async function GET() {
  const articles = await prisma.articleAlimentation.findMany({
    where: { isActive: true },
    include: { categorie: true },
    orderBy: { nom: 'asc' },
  });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;
  if (!hasPermission(user.role, 'alimentation:manage')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json();
  const article = await prisma.articleAlimentation.create({ data: body });
  return NextResponse.json(article, { status: 201 });
}
