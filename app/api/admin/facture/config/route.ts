import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès refusé - Super Admin uniquement' }, { status: 403 });
  }

  try {
    const config = await prisma.$queryRaw`
      SELECT * FROM "FactureConfig" WHERE id = 'default'
    `;

    return NextResponse.json((config as any[])[0] || {});
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès refusé - Super Admin uniquement' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      nomEntreprise,
      adresse,
      ville,
      pays,
      telephone,
      email,
      siteWeb,
      logo,
      numeroRegistre,
      ninea,
      rccm,
      conditions,
      piedPage,
    } = body;

    await prisma.$executeRaw`
      UPDATE "FactureConfig" SET
        "nomEntreprise" = ${nomEntreprise || 'Pratisig Consulting Service'},
        "adresse" = ${adresse || null},
        "ville" = ${ville || 'Dakar'},
        "pays" = ${pays || 'Sénégal'},
        "telephone" = ${telephone || null},
        "email" = ${email || null},
        "siteWeb" = ${siteWeb || null},
        "logo" = ${logo || null},
        "numeroRegistre" = ${numeroRegistre || null},
        "ninea" = ${ninea || null},
        "rccm" = ${rccm || null},
        "conditions" = ${conditions || null},
        "piedPage" = ${piedPage || null},
        "updatedAt" = NOW()
      WHERE id = 'default'
    `;

    return NextResponse.json({ success: true, message: 'Configuration mise à jour' });
  } catch (error) {
    console.error('Erreur update config facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
