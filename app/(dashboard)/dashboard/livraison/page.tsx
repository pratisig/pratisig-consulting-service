import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { MapPin, Package, Clock, Plus, Truck, Eye, User, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LivraisonDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isLivreur = user.role === 'LIVREUR';
  const isManager = ['ADMIN', 'SUPER_ADMIN', 'MANAGER_LIVRAISON'].includes(user.role);
  const isClient = !isLivreur && !isManager;

  const livraisons = await prisma.livraison.findMany({
    where: isLivreur ? { livreurId: user.id } : isManager ? {} : { clientId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      client: { select: { name: true, phone: true } },
      livreur: { select: { name: true, phone: true } },
    },
  }).catch(() => []);

  const total = livraisons.length;
  const enAttente = livraisons.filter((l: any) => l.statut === 'EN_ATTENTE').length;
  const enCours = livraisons.filter((l: any) =>
    ['ACCEPTEE', 'EN_ROUTE_COLLECTE', 'COLLECTE', 'EN_ROUTE_LIVRAISON'].includes(l.statut)
  ).length;
  const livrees = livraisons.filter((l: any) => l.statut === 'LIVREE').length;

  const STATUT_COLORS: Record<string, string> = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    ACCEPTEE: 'bg-blue-100 text-blue-700',
    EN_ROUTE_COLLECTE: 'bg-purple-100 text-purple-700',
    COLLECTE: 'bg-indigo-100 text-indigo-700',
    EN_ROUTE_LIVRAISON: 'bg-orange-100 text-orange-700',
    LIVREE: 'bg-green-100 text-green-700',
    ANNULEE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Service de Livraison</h1>
            <p className="text-gray-500 text-sm">
              {isLivreur ? 'Mes courses assignées' : isManager ? 'Gestion de toutes les livraisons' : 'Mes commandes de livraison'}
            </p>
          </div>
          {isClient && (
            <Link href="/dashboard/livraison/nouvelle" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
              <Plus size={16} /> Nouvelle livraison
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow border">
            <p className="text-3xl font-bold text-[#1a3a5c]">{total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-5 shadow border border-yellow-200">
            <p className="text-3xl font-bold text-yellow-700">{enAttente}</p>
            <p className="text-sm text-yellow-600">En attente</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-5 shadow border border-purple-200">
            <p className="text-3xl font-bold text-purple-700">{enCours}</p>
            <p className="text-sm text-purple-600">En cours</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-5 shadow border border-green-200">
            <p className="text-3xl font-bold text-green-700">{livrees}</p>
            <p className="text-sm text-green-600">Livrées</p>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2">
            <Truck size={18} className="text-[#1a3a5c]" />
            <h2 className="font-semibold text-[#1a3a5c]">Liste des livraisons</h2>
          </div>
          <div className="divide-y">
            {livraisons.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Package size={48} className="mx-auto mb-4 opacity-30" />
                <p>Aucune livraison trouvée</p>
                {isClient && (
                  <Link href="/dashboard/livraison/nouvelle" className="inline-block mt-4 bg-[#1a3a5c] text-white px-6 py-2 rounded-xl text-sm">
                    Créer ma première livraison
                  </Link>
                )}
              </div>
            ) : (livraisons as any[]).map((liv) => (
              <Link
                key={liv.id}
                href={`/dashboard/livraison/${liv.id}`}
                className="block p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[liv.statut] ?? 'bg-gray-100'}`}>
                        {liv.statut.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        <Clock size={10} className="inline mr-1" />
                        {new Date(liv.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                      <MapPin size={12} className="text-green-500 shrink-0" />
                      <span className="truncate max-w-xs">{liv.adresseCollecte}</span>
                      <span className="text-gray-400">→</span>
                      <MapPin size={12} className="text-red-500 shrink-0" />
                      <span className="truncate max-w-xs">{liv.adresseDest}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      {liv.client && (
                        <span className="flex items-center gap-1">
                          <User size={10} /> {liv.client.name || 'Client'}
                          {liv.client.phone && <span className="text-gray-400">({liv.client.phone})</span>}
                        </span>
                      )}
                      {liv.livreur && (
                        <span className="flex items-center gap-1 text-[#1a3a5c] font-medium">
                          <Truck size={10} /> {liv.livreur.name}
                          {liv.livreur.phone && <span className="text-gray-400">({liv.livreur.phone})</span>}
                        </span>
                      )}
                      {!liv.livreur && liv.statut === 'EN_ATTENTE' && (
                        <span className="text-orange-500 font-medium">En attente d'un livreur...</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4 flex flex-col items-end gap-2">
                    <p className="font-bold text-[#e8a020]">{liv.prix.toLocaleString('fr-FR')} FCFA</p>
                    <span className="text-xs text-[#1a3a5c] flex items-center gap-1">
                      <Eye size={12} /> Voir détails
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
