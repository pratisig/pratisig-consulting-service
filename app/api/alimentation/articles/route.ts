import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';


export async function GET() {
  const articles = await prisma.articleAlimentation.findMany({
    where: { isActive: true },
    include: { categorie: true },
    orderBy: { nom: 'asc' },
  });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  
  if (!['SUPER_ADMIN','ADMIN','MANAGER_ALIMENTATION'].includes(user.role)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const body = await req.json();
  const article = await prisma.articleAlimentation.create({ data: body });
  return NextResponse.json(article, { status: 201 });
}
