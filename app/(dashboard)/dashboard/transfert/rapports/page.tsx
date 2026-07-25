import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

import { ArrowLeft, TrendingUp, DollarSign, Activity, Filter, Download } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RapportsTransfertPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  if (!['SUPER_ADMIN','ADMIN','MANAGER_TRANSFERT'].includes(user.role)) redirect('/dashboard');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalTransactions, transactionsAujourdhui, totalMontant, parService, parType, parStatut, transactions] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.count({ where: { createdAt: { gte: today } } }),
    prisma.transaction.aggregate({ _sum: { montant: true } }),
    prisma.transaction.groupBy({
      by: ['service'],
      _count: { id: true },
      _sum: { montant: true },
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      _count: { id: true },
      _sum: { montant: true },
    }),
    prisma.transaction.groupBy({
      by: ['statut'],
      _count: { id: true },
      _sum: { montant: true },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        agent: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]).catch(() => [0, 0, { _sum: { montant: 0 } }, [], [], [], []]);

  const SERVICES_INFO: Record<string, { couleur: string; logo: string }> = {
    WAVE: { couleur: '#1B9BF0', logo: '/logos/transfert/wave.png' },
    ORANGE_MONEY: { couleur: '#FF6600', logo: '/logos/transfert/orange-money.png' },
    YASH_MONEY: { couleur: '#8B0000', logo: '/logos/transfert/yash-money.png' },
    KAPEY: { couleur: '#006400', logo: '/logos/transfert/kpay.png' },
    FREE_MONEY: { couleur: '#CC0000', logo: '/logos/transfert/free-money.png' },
    EMONEY: { couleur: '#4B0082', logo: '/logos/transfert/emoney.png' },
  };

  const TYPES_INFO: Record<string, { label: string; couleur: string }> = {
    DEPOT: { label: 'Dépôt', couleur: 'bg-blue-100 text-blue-700' },
    RETRAIT: { label: 'Retrait', couleur: 'bg-orange-100 text-orange-700' },
    TRANSFERT: { label: 'Transfert', couleur: 'bg-green-100 text-green-700' },
    PAIEMENT_FACTURE: { label: 'Paiement facture', couleur: 'bg-purple-100 text-purple-700' },
    RECHARGE: { label: 'Recharge', couleur: 'bg-pink-100 text-pink-700' },
  };

  const STATUTS_INFO: Record<string, { label: string; couleur: string }> = {
    EN_COURS: { label: 'En cours', couleur: 'bg-yellow-100 text-yellow-700' },
    SUCCES: { label: 'Succès', couleur: 'bg-green-100 text-green-700' },
    ECHEC: { label: 'Échec', couleur: 'bg-red-100 text-red-700' },
    ANNULEE: { label: 'Annulée', couleur: 'bg-gray-100 text-gray-700' },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/transfert" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a5c]">Rapports Transfert</h1>
              <p className="text-gray-500 text-sm">Suivi complet des opérations</p>
            </div>
          </div>
          <button className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
            <Download size={16} /> Exporter CSV
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total opérations</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{totalTransactions as number}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Aujourd'hui</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{transactionsAujourdhui as number}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-yellow-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Volume total</p>
              <p className="text-xl font-bold text-[#1a3a5c]">{((totalMontant as any)?._sum?.montant ?? 0).toLocaleString('fr-FR')} F</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Filter className="text-purple-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Services actifs</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{(parService as any[]).length}</p>
            </div>
          </div>
        </div>

        {/* Répartition par service */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4">Volume par service</h2>
            <div className="space-y-3">
              {(parService as any[]).map((s) => {
                const info = SERVICES_INFO[s.service] ?? { couleur: '#888', logo: '' };
                return (
                  <div key={s.service} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <img src={info.logo} alt={s.service} className="w-8 h-8 object-contain" />
                      <span className="font-semibold" style={{ color: info.couleur }}>{s.service.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1a3a5c]">{s._count.id} ops</p>
                      <p className="text-sm text-gray-500">{(s._sum.montant ?? 0).toLocaleString('fr-FR')} F</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Répartition par type */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4">Répartition par type</h2>
            <div className="space-y-3">
              {(parType as any[]).map((t) => {
                const info = TYPES_INFO[t.type] ?? { label: t.type, couleur: 'bg-gray-100 text-gray-700' };
                return (
                  <div key={t.type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${info.couleur}`}>{info.label}</span>
                    <div className="text-right">
                      <p className="font-bold text-[#1a3a5c]">{t._count.id} ops</p>
                      <p className="text-sm text-gray-500">{(t._sum.montant ?? 0).toLocaleString('fr-FR')} F</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-bold text-[#1a3a5c] mb-4">Statut des opérations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(parStatut as any[]).map((s) => {
              const info = STATUTS_INFO[s.statut] ?? { label: s.statut, couleur: 'bg-gray-100 text-gray-700' };
              return (
                <div key={s.statut} className={`p-4 rounded-xl ${info.couleur}`}>
                  <p className="text-sm font-medium">{info.label}</p>
                  <p className="text-2xl font-bold mt-1">{s._count.id}</p>
                  <p className="text-xs mt-1 opacity-75">{(s._sum.montant ?? 0).toLocaleString('fr-FR')} F</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tableau des transactions */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-bold text-[#1a3a5c]">Dernières opérations (100)</h2>
            <p className="text-sm text-gray-500 mt-1">Détail complet de toutes les transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Agent</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Montant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(transactions as any[]).map((t) => {
                  const serviceInfo = SERVICES_INFO[t.service] ?? { couleur: '#888', logo: '' };
                  const typeInfo = TYPES_INFO[t.type] ?? { label: t.type, couleur: 'bg-gray-100 text-gray-700' };
                  const statutInfo = STATUTS_INFO[t.statut] ?? { label: t.statut, couleur: 'bg-gray-100 text-gray-700' };
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={serviceInfo.logo} alt={t.service} className="w-6 h-6 object-contain" />
                          <span className="text-sm font-medium" style={{ color: serviceInfo.couleur }}>{t.service.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeInfo.couleur}`}>{typeInfo.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[#1a3a5c]">{t.clientNom || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{t.clientPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{t.agent?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{t.agent?.role}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-bold text-[#e8a020]">{t.montant.toLocaleString('fr-FR')} F</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statutInfo.couleur}`}>{statutInfo.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(transactions as any[]).length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Activity size={48} className="mx-auto mb-3 opacity-30" />
              <p>Aucune transaction pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
