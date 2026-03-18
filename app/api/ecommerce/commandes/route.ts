import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { commandeSchema } from '@/lib/validation/ecommerce';
import { rateLimit } from '@/lib/security/rate-limit';
import { logAudit } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Connexion requise pour commander' }, { status: 401 });
  const user = session.user as any;

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(`commande:${ip}`, 10, 3_600_000)) {
    return NextResponse.json({ error: 'Trop de commandes. Réessayez plus tard.' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = commandeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { lignes, modePaiement, adresseLivraison, villeLivraison, telephoneClient, notesClient } = parsed.data;

  // Vérifier stock et calculer total
  const produits = await prisma.produit.findMany({
    where: { id: { in: lignes.map(l => l.produitId) }, isActive: true },
  });

  for (const ligne of lignes) {
    const produit = produits.find(p => p.id === ligne.produitId);
    if (!produit) return NextResponse.json({ error: `Produit introuvable` }, { status: 400 });
    if (produit.stock < ligne.quantite) {
      return NextResponse.json({ error: `Stock insuffisant pour ${produit.nom}` }, { status: 400 });
    }
  }

  const total = lignes.reduce((s, l) => {
    const p = produits.find(pr => pr.id === l.produitId)!;
    return s + (p.prixPromo ?? p.prix) * l.quantite;
  }, 0);

  const commande = await prisma.commande.create({
    data: {
      clientId: user.id,
      total,
      modePaiement,
      adresseLivraison,
      villeLivraison,
      telephoneClient,
      notesClient,
      lignes: {
        create: lignes.map(l => {
          const p = produits.find(pr => pr.id === l.produitId)!;
          return { produitId: l.produitId, quantite: l.quantite, prixUnit: p.prixPromo ?? p.prix, total: (p.prixPromo ?? p.prix) * l.quantite };
        }),
      },
    },
  });

  // Décrémenter le stock
  await Promise.all(lignes.map(l =>
    prisma.produit.update({ where: { id: l.produitId }, data: { stock: { decrement: l.quantite } } })
  ));

  await logAudit({ userId: user.id, action: 'COMMANDE_CREATE', entity: 'Commande', entityId: commande.id, metadata: { total, modePaiement } });
  return NextResponse.json({ commande, message: 'Commande passée avec succès !' }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;

  const commandes = await prisma.commande.findMany({
    where: user.role === 'CLIENT' ? { clientId: user.id } : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { lignes: { include: { produit: true } }, client: { select: { name: true, email: true } } },
  });
  return NextResponse.json(commandes);
}
