import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès refusé - Super Admin uniquement' }, { status: 403 });
  }

  try {
    // Vérifier si la table existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'FactureConfig'
      ) as exists
    `;

    if (!(tableExists as any[])[0]?.exists) {
      // Table n'existe pas, retourner config par défaut
      return NextResponse.json({
        nomEntreprise: 'Pratisig Consulting Service',
        adresse: 'Dakar',
        ville: 'Dakar',
        pays: 'Sénégal',
        telephone: '+221 33 000 00 00',
        email: 'contact@pratisig.sn',
        siteWeb: 'https://pratisig.sn',
        logo: '',
        numeroRegistre: '',
        ninea: '',
        rccm: '',
        conditions: 'Paiement à la livraison',
        piedPage: 'Merci de votre confiance',
      });
    }

    const config = await prisma.$queryRaw`
      SELECT * FROM "FactureConfig" WHERE id = 'default'
    `;

    return NextResponse.json((config as any[])[0] || {});
  } catch (error) {
    console.error('Erreur GET config facture:', error);
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
    
    // Vérifier si la table existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'FactureConfig'
      ) as exists
    `;

    if (!(tableExists as any[])[0]?.exists) {
      // Créer la table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "FactureConfig" (
          id TEXT PRIMARY KEY,
          "nomEntreprise" TEXT NOT NULL DEFAULT 'Pratisig Consulting Service',
          "adresse" TEXT,
          "ville" TEXT DEFAULT 'Dakar',
          "pays" TEXT DEFAULT 'Sénégal',
          "telephone" TEXT,
          "email" TEXT,
          "siteWeb" TEXT,
          "logo" TEXT,
          "numeroRegistre" TEXT,
          "ninea" TEXT,
          "rccm" TEXT,
          "conditions" TEXT,
          "piedPage" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `;
    }

    const configData = {
      nomEntreprise: body.nomEntreprise || 'Pratisig Consulting Service',
      adresse: body.adresse || null,
      ville: body.ville || 'Dakar',
      pays: body.pays || 'Sénégal',
      telephone: body.telephone || null,
      email: body.email || null,
      siteWeb: body.siteWeb || null,
      logo: body.logo || null,
      numeroRegistre: body.numeroRegistre || null,
      ninea: body.ninea || null,
      rccm: body.rccm || null,
      conditions: body.conditions || null,
      piedPage: body.piedPage || null,
    };

    // Vérifier si l'enregistrement existe
    const existing = await prisma.$queryRaw`
      SELECT id FROM "FactureConfig" WHERE id = 'default'
    `;

    if ((existing as any[]).length > 0) {
      // Mettre à jour
      await prisma.$executeRaw`
        UPDATE "FactureConfig" SET
          "nomEntreprise" = ${configData.nomEntreprise},
          "adresse" = ${configData.adresse},
          "ville" = ${configData.ville},
          "pays" = ${configData.pays},
          "telephone" = ${configData.telephone},
          "email" = ${configData.email},
          "siteWeb" = ${configData.siteWeb},
          "logo" = ${configData.logo},
          "numeroRegistre" = ${configData.numeroRegistre},
          "ninea" = ${configData.ninea},
          "rccm" = ${configData.rccm},
          "conditions" = ${configData.conditions},
          "piedPage" = ${configData.piedPage},
          "updatedAt" = NOW()
        WHERE id = 'default'
      `;
    } else {
      // Créer
      await prisma.$executeRaw`
        INSERT INTO "FactureConfig" (id, "nomEntreprise", "adresse", "ville", "pays", "telephone", "email", "siteWeb", "logo", "numeroRegistre", "ninea", "rccm", "conditions", "piedPage")
        VALUES ('default', ${configData.nomEntreprise}, ${configData.adresse}, ${configData.ville}, ${configData.pays}, ${configData.telephone}, ${configData.email}, ${configData.siteWeb}, ${configData.logo}, ${configData.numeroRegistre}, ${configData.ninea}, ${configData.rccm}, ${configData.conditions}, ${configData.piedPage})
      `;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuration mise à jour avec succès',
      config: configData 
    });
  } catch (error: any) {
    console.error('Erreur PUT config facture:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur', 
      details: error.message 
    }, { status: 500 });
  }
}
