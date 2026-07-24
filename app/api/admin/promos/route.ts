import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const promos = await prisma.$queryRaw`
      SELECT * FROM "CodePromo" ORDER BY "createdAt" DESC
    `;

    return NextResponse.json(promos);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { code, type, valeur, minCommande, maxUsage, dateFin } = body;

    if (!code || !valeur) {
      return NextResponse.json({ error: 'Code et valeur requis' }, { status: 400 });
    }

    // Vérifier si le code existe déjà
    const existing = await prisma.$queryRaw`
      SELECT id FROM "CodePromo" WHERE code = ${code}
    `;

    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Ce code existe déjà' }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO "CodePromo" (code, type, valeur, "minCommande", "maxUsage", "dateFin", "creePar")
      VALUES (${code}, ${type || 'PERCENTAGE'}, ${valeur}, ${minCommande || 0}, ${maxUsage || 0}, ${dateFin ? new Date(dateFin) : null}, ${user.id})
    `;

    return NextResponse.json({ success: true, message: 'Code promo créé' }, { status: 201 });
  } catch (error) {
    console.error('Erreur création promo:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
