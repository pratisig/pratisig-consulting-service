import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const produitId = searchParams.get('produitId');

  try {
    let avis;
    
    if (produitId) {
      // Avis pour un produit spécifique
      avis = await prisma.$queryRaw`
        SELECT a.*, u.name as "clientName", u.email as "clientEmail"
        FROM "Avis" a
        JOIN "User" u ON a."clientId" = u.id
        WHERE a."produitId" = ${produitId}
        AND a."isApprouve" = true
        ORDER BY a."createdAt" DESC
      `;
    } else {
      // Derniers avis (pour admin)
      avis = await prisma.$queryRaw`
        SELECT a.*, u.name as "clientName", p.nom as "produitNom"
        FROM "Avis" a
        JOIN "User" u ON a."clientId" = u.id
        JOIN "Produit" p ON a."produitId" = p.id
        ORDER BY a."createdAt" DESC
        LIMIT 50
      `;
    }

    return NextResponse.json(avis);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { produitId, note, commentaire } = body;

    if (!produitId || !note || note < 1 || note > 5) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // Vérifier si l'utilisateur a déjà donné un avis
    const existing = await prisma.$queryRaw`
      SELECT id FROM "Avis" WHERE "produitId" = ${produitId} AND "clientId" = ${user.id}
    `;

    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Vous avez déjà donné un avis pour ce produit' }, { status: 400 });
    }

    // Créer l'avis
    await prisma.$executeRaw`
      INSERT INTO "Avis" ("produitId", "clientId", note, commentaire, "isVerified")
      VALUES (${produitId}, ${user.id}, ${note}, ${commentaire || ''}, true)
    `;

    // Mettre à jour la moyenne du produit
    await prisma.$executeRaw`
      UPDATE "Produit" SET 
        "noteMoyenne" = (
          SELECT AVG(note)::float FROM "Avis" WHERE "produitId" = ${produitId} AND "isApprouve" = true
        ),
        "nbAvis" = (
          SELECT COUNT(*)::int FROM "Avis" WHERE "produitId" = ${produitId} AND "isApprouve" = true
        )
      WHERE id = ${produitId}
    `;

    return NextResponse.json({ success: true, message: 'Avis ajouté' }, { status: 201 });
  } catch (error) {
    console.error('Erreur création avis:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
