import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const categories = await prisma.categorieEcommerce.findMany({
      orderBy: { nom: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur chargement catégories' }, { status: 500 });
  }
}
