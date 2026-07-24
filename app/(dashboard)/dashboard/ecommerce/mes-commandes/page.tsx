import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

import Link from 'next/link';
import { ShoppingBag, Package, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MesCommandesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Les clients voient leurs propres commandes
  const commandes = await prisma.commande.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      lignes: {
        include: {
          produit: {
            select: {
              nom: true,
              prix: true,
            },
          },
        },
      },
    },
  }).catch(() => []);

  const STATUT_COLORS: Record<string, string> = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    CONFIRMEE: 'bg-blue-100 text-blue-700',
    EN_PREPARATION: 'bg-purple-100 text-purple-700',
    EXPEDIEE: 'bg-orange-100 text-orange-700',
    LIVREE: 'bg-green-100 text-green-700',
    ANNULEE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Mes Commandes</h1>
            <p className="text-gray-500 text-sm">Suivi de vos commandes</p>
          </div>
          <Link href="/boutique" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
            <ShoppingBag size={16} /> Continuer mes achats
          </Link>
        </div>

        {commandes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow text-center">
            <Package size={64} className="mx-auto mb-4 text-gray-200" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Aucune commande</h2>
            <p className="text-gray-500 mb-6">Vous n&apos;avez pas encore passé de commande</p>
            <Link href="/boutique" className="inline-block bg-[#e8a020] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#d4911d] transition-colors">
              Aller à la boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {commandes.map((cmd: any) => (
              <div key={cmd.id} className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Commande du {new Date(cmd.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p className="text-sm font-mono text-gray-400">#{cmd.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[cmd.statut]}`}>
                    {cmd.statut.replace('_', ' ')}
                  </span>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Articles :</p>
                  <div className="space-y-1">
                    {cmd.lignes.map((ligne: any) => (
                      <div key={ligne.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{ligne.produit.nom} × {ligne.quantite}</span>
                        <span className="font-medium">{ligne.total.toLocaleString('fr-FR')} F</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <p>Livraison : {cmd.villeLivraison}</p>
                    <p className="text-xs text-gray-400">{cmd.adresseLivraison}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-[#e8a020]">{cmd.total.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>

                {cmd.statut === 'LIVREE' && (
                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/dashboard/ecommerce/commandes/${cmd.id}`} className="inline-flex items-center gap-2 text-sm text-[#1a3a5c] hover:underline">
                      <Eye size={14} /> Voir les détails et facture
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
