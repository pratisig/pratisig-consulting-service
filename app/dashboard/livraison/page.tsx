import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { MapPin, Package, Clock, Plus, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LivraisonDashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;

  const isLivreur = user.role === 'LIVREUR';
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'SUPERVISEUR'].includes(user.role);

  const livraisons = await prisma.livraison.findMany({
    where: isLivreur ? { livreurId: user.id } : isAdmin ? {} : { clientId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      client: { select: { name: true, phone: true } },
      livreur: { select: { name: true, phone: true } },
      zone: true,
    },
  }).catch(() => []);

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
              {isLivreur ? 'Mes courses' : isAdmin ? 'Gestion des livraisons' : 'Mes commandes'}
            </p>
          </div>
          {!isLivreur && !isAdmin && (
            <Link href="/dashboard/livraison/nouvelle" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
              <Plus size={16} /> Nouvelle livraison
            </Link>
          )}
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', val: livraisons.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'En attente', val: livraisons.filter((l: any) => l.statut === 'EN_ATTENTE').length, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'En cours', val: livraisons.filter((l: any) => ['ACCEPTEE','EN_ROUTE_COLLECTE','COLLECTE','EN_ROUTE_LIVRAISON'].includes(l.statut)).length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Livrées', val: livraisons.filter((l: any) => l.statut === 'LIVREE').length, color: 'bg-green-50 text-green-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <p className="text-3xl font-bold">{s.val}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow">
          <div className="p-4 border-b flex items-center gap-2">
            <Truck size={18} className="text-[#1a3a5c]" />
            <h2 className="font-semibold text-[#1a3a5c]">Liste des livraisons</h2>
          </div>
          <div className="divide-y">
            {livraisons.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Package size={48} className="mx-auto mb-4 opacity-30" />
                <p>Aucune livraison trouvée</p>
              </div>
            ) : (livraisons as any[]).map((liv) => (
              <div key={liv.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[liv.statut] ?? 'bg-gray-100'}`}>{liv.statut.replace(/_/g, ' ')}</span>
                      {liv.zone && <span className="text-xs text-gray-400">{liv.zone.nom}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={12} className="text-green-500" />
                      <span className="truncate max-w-48">{liv.adresseCollecte}</span>
                      <span className="text-gray-400">→</span>
                      <MapPin size={12} className="text-red-500" />
                      <span className="truncate max-w-48">{liv.adresseDest}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {liv.client && <span>Client: {liv.client.name}</span>}
                      {liv.livreur && <span>Livreur: {liv.livreur.name}</span>}
                      <span><Clock size={10} className="inline" /> {new Date(liv.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#e8a020]">{liv.prix.toLocaleString('fr-FR')} F</p>
                    {isLivreur && liv.statut === 'EN_ATTENTE' && (
                      <button className="mt-1 text-xs bg-[#1a3a5c] text-white px-3 py-1 rounded-lg hover:bg-[#0d2440]">
                        Accepter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
