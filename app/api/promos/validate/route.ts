import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, montantCommande } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code requis' }, { status: 400 });
    }

    // Vérifier le code promo
    const promos = await (await import('@/lib/db/prisma')).prisma.$queryRaw`
      SELECT * FROM "CodePromo" 
      WHERE code = ${code} 
      AND "isActive" = true
      AND ("dateFin" IS NULL OR "dateFin" > NOW())
      AND ("maxUsage" = 0 OR "usageCount" < "maxUsage")
    `;

    const promo = (promos as any[])[0];

    if (!promo) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Code invalide ou expiré' 
      });
    }

    // Vérifier le montant minimum
    if (montantCommande < promo.minCommande) {
      return NextResponse.json({ 
        valid: false, 
        error: `Montant minimum: ${promo.minCommande.toLocaleString('fr-FR')} FCFA` 
      });
    }

    // Calculer la réduction
    let reduction = 0;
    if (promo.type === 'PERCENTAGE') {
      reduction = (montantCommande * promo.valeur) / 100;
    } else {
      reduction = promo.valeur;
    }

    // Ne pas dépasser le montant de la commande
    reduction = Math.min(reduction, montantCommande);

    const totalFinal = montantCommande - reduction;

    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        valeur: promo.valeur,
      },
      reduction: Math.round(reduction),
      totalFinal: Math.round(totalFinal),
    });
  } catch (error) {
    console.error('Erreur validation promo:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}
