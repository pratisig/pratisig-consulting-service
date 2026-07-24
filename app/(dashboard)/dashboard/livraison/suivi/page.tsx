import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

import Link from 'next/link';
import { Truck, Package, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuiviLivraisonPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Récupérer les livraisons selon le rôle
  let livraisons;
  
  if (user.role === 'LIVREUR') {
    // Livreurs voient les livraisons qui leur sont assignées
    livraisons = await prisma.livraison.findMany({
      where: { livreurId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  } else if (['SUPER_ADMIN', 'ADMIN', 'MANAGER_LIVRAISON'].includes(user.role)) {
    // Admins voient toutes les livraisons
    livraisons = await prisma.livraison.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } else {
    // Clients voient leurs propres livraisons
    livraisons = await prisma.livraison.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  const STATUT_COLORS: Record<string, string> = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    ACCEPTEE: 'bg-blue-100 text-blue-700',
    EN_ROUTE_COLLECTE: 'bg-indigo-100 text-indigo-700',
    COLLECTE: 'bg-purple-100 text-purple-700',
    EN_ROUTE_LIVRAISON: 'bg-orange-100 text-orange-700',
    LIVREE: 'bg-green-100 text-green-700',
    ANNULEE: 'bg-red-100 text-red-700',
  };

  const STATUT_ICONS: Record<string, string> = {
    EN_ATTENTE: '⏳',
    ACCEPTEE: '✅',
    EN_ROUTE_COLLECTE: '🚴',
    COLLECTE: '📦',
    EN_ROUTE_LIVRAISON: '',
    LIVREE: '',
    ANNULEE: '❌',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Suivi des Livraisons</h1>
            <p className="text-gray-500 text-sm">
              {user.role === 'LIVREUR' ? 'Vos livraisons assignées' : 
               user.role === 'CLIENT' ? 'Vos demandes de livraison' : 'Toutes les livraisons'}
            </p>
          </div>
          {user.role !== 'LIVREUR' && (
            <Link href="/dashboard/livraison/nouvelle" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
              <Package size={16} /> Nouvelle livraison
            </Link>
          )}
        </div>

        {livraisons.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow text-center">
            <Truck size={64} className="mx-auto mb-4 text-gray-200" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Aucune livraison</h2>
            <p className="text-gray-500">
              {user.role === 'LIVREUR' ? 'Aucune livraison ne vous est assignée' : 'Vous n\'avez pas encore demandé de livraison'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {livraisons.map((livraison: any) => (
              <div key={livraison.id} className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Demandée le {new Date(livraison.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm font-mono text-gray-400">#{livraison.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[livraison.statut]}`}>
                    {STATUT_ICONS[livraison.statut]} {livraison.statut.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-green-600" />
                      <p className="text-xs font-semibold text-green-700">Point de collecte</p>
                    </div>
                    <p className="text-sm text-gray-700">{livraison.adresseCollecte}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-red-600" />
                      <p className="text-xs font-semibold text-red-700">Point de livraison</p>
                    </div>
                    <p className="text-sm text-gray-700">{livraison.adresseDest}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{livraison.description || 'Aucune description'}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Prix</p>
                    <p className="text-xl font-bold text-[#e8a020]">{livraison.prix.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>

                {livraison.statut !== 'LIVREE' && livraison.statut !== 'ANNULEE' && (
                  <div className="mt-4 pt-4 border-t">
                    <Link href={`/dashboard/livraison/${livraison.id}`} className="inline-flex items-center gap-2 text-sm text-[#1a3a5c] hover:underline font-medium">
                      <Truck size={14} /> Voir les détails et suivi
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
