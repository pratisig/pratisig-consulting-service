import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ArrowLeft, Home, TrendingUp, Eye, CheckCircle, Clock, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ImmobilierStatsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER'].includes(user.role)) {
    redirect('/dashboard');
  }

  // Statistiques globales
  const stats = await prisma.bienImmobilier.aggregate({
    _count: { id: true },
    _sum: {
      prixVente: true,
      prixLoyer: true,
    },
  });

  // Répartition par statut
  const parStatut = await prisma.bienImmobilier.groupBy({
    by: ['statut'],
    _count: { id: true },
  });

  // Répartition par type
  const parType = await prisma.bienImmobilier.groupBy({
    by: ['type'],
    _count: { id: true },
  });

  // Biens publiés vs en attente
  const publies = await prisma.bienImmobilier.count({ where: { isPublished: true } });
  const enAttente = await prisma.bienImmobilier.count({ where: { isPublished: false } });

  // Demandes de visite totales
  const totalVisites = await prisma.demandeVisite.count();

  // Biens les plus visités
  const topBiens = await prisma.bienImmobilier.findMany({
    take: 5,
    orderBy: {
      demandesVisite: {
        _count: 'desc',
      },
    },
    include: {
      _count: {
        select: { demandesVisite: true },
      },
    },
  });

  const STATUT_COLORS: Record<string, string> = {
    DISPONIBLE: 'bg-green-100 text-green-700',
    LOUE: 'bg-blue-100 text-blue-700',
    VENDU: 'bg-gray-100 text-gray-500',
    RESERVE: 'bg-yellow-100 text-yellow-700',
    INDISPONIBLE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin/immobilier" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Statistiques Immobilier</h1>
            <p className="text-gray-500 text-sm">Vue d'ensemble des performances</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Home className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total biens</p>
                <p className="text-2xl font-bold text-[#1a3a5c]">{stats._count.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-green-600" size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Publiés</p>
                <p className="text-2xl font-bold text-green-600">{publies}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="text-yellow-600" size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{enAttente}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Eye className="text-purple-600" size={22} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Demandes visite</p>
                <p className="text-2xl font-bold text-purple-600">{totalVisites}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par statut */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Répartition par statut
            </h2>
            <div className="space-y-3">
              {parStatut.map((s) => (
                <div key={s.statut} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[s.statut]}`}>
                    {s.statut}
                  </span>
                  <span className="font-bold text-[#1a3a5c]">{s._count.id} biens</span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par type */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
              <Home size={18} /> Répartition par type
            </h2>
            <div className="space-y-3">
              {parType.map((t) => (
                <div key={t.type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="font-medium text-[#1a3a5c]">{t.type}</span>
                  <span className="font-bold text-[#1a3a5c]">{t._count.id} biens</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top biens les plus visités */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
            <Eye size={18} /> Top 5 des biens les plus demandés
          </h2>
          <div className="space-y-3">
            {topBiens.map((bien, index) => (
              <Link
                key={bien.id}
                href={`/dashboard/immobilier/${bien.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#1a3a5c] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a3a5c]">{bien.titre}</p>
                    <p className="text-xs text-gray-500">{bien.type} - {bien.ville}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{bien._count.demandesVisite} visites</p>
                  <p className="text-xs text-gray-500">
                    {bien.prixVente ? `${bien.prixVente.toLocaleString('fr-FR')} F` : `${bien.prixLoyer?.toLocaleString('fr-FR')} F/mois`}
                  </p>
                </div>
              </Link>
            ))}
            {topBiens.length === 0 && (
              <p className="text-center text-gray-400 py-8">Aucun bien enregistré</p>
            )}
          </div>
        </div>

        {/* Valeur totale du portefeuille */}
        <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0d2440] rounded-2xl p-6 text-white">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <DollarSign size={18} /> Valeur du portefeuille
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-blue-200 text-sm">Valeur totale à la vente</p>
              <p className="text-3xl font-bold text-[#e8a020]">
                {(stats._sum.prixVente || 0).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Revenus locatifs mensuels</p>
              <p className="text-3xl font-bold text-green-400">
                {(stats._sum.prixLoyer || 0).toLocaleString('fr-FR')} FCFA/mois
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
