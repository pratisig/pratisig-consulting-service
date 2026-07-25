import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const categories = await prisma.categorieAlimentation.findMany({
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur chargement catégories:', error);
    return NextResponse.json([]);
  }
}
