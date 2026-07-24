import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    // Récupérer la commande
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lignes: {
          include: {
            produit: {
              select: {
                nom: true,
                prix: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!commande) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le client ou un admin
    if (
      commande.clientId !== user.id &&
      !['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)
    ) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer la configuration de facture
    const config = await prisma.$queryRaw`
      SELECT * FROM "FactureConfig" WHERE id = 'default'
    `;
    const configData = (config as any[])[0] || {};

    // Générer ou récupérer le numéro de facture
    let numeroFacture = (commande as any).numeroFacture;
    if (!numeroFacture) {
      const numero = await prisma.$queryRaw`
        SELECT nextval('facture_numero_seq') as num
      `;
      const num = (numero as any[])[0]?.num || 1000;
      numeroFacture = `FAC-${new Date().getFullYear()}-${String(num).padStart(6, '0')}`;

      await prisma.commande.update({
        where: { id },
        data: {
          numeroFacture,
          factureGeneree: true,
          dateFacture: new Date(),
        } as any,
      });
    }

    // Construire les données de la facture
    const factureData = {
      numero: numeroFacture,
      date: new Date((commande as any).dateFacture || commande.createdAt).toLocaleDateString('fr-FR'),
      config: configData,
      client: {
        nom: commande.client.name || 'Client',
        email: commande.client.email,
        telephone: commande.client.phone || commande.telephoneClient,
        adresse: commande.adresseLivraison,
        ville: commande.villeLivraison,
      },
      lignes: commande.lignes.map((ligne) => ({
        nom: ligne.produit.nom,
        quantite: ligne.quantite,
        prixUnit: ligne.prixUnit,
        total: ligne.total,
      })),
      sousTotal: commande.total,
      reduction: (commande as any).reduction || 0,
      total: (commande as any).totalFinal || commande.total - ((commande as any).reduction || 0),
      modePaiement: commande.modePaiement,
      statut: commande.statut,
    };

    return NextResponse.json(factureData);
  } catch (error) {
    console.error('Erreur récupération facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
