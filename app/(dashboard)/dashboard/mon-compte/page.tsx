import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { User, Home, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MonComptePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Récupérer l'utilisateur complet avec le statut
  const userComplete = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  if (!userComplete) redirect('/login');

  const isProprietaire = userComplete.role === 'PROPRIETAIRE';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER'].includes(userComplete.role);
  const canCreateBiens = isProprietaire || isAdmin;

  // Récupérer les biens de l'utilisateur si propriétaire
  let biens: any[] = [];
  let stats = { total: 0, publies: 0, enAttente: 0 };
  
  if (canCreateBiens) {
    biens = await prisma.bienImmobilier.findMany({
      where: { proprietaireId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        _count: {
          select: { demandesVisite: true }
        }
      }
    }).catch(() => []);

    stats = {
      total: biens.length,
      publies: biens.filter((b) => b.isPublished).length,
      enAttente: biens.filter((b) => !b.isPublished).length,
    };
  }

  const STATUT_COLORS: Record<string, string> = {
    DISPONIBLE: 'bg-green-100 text-green-700',
    LOUE: 'bg-blue-100 text-blue-700',
    VENDU: 'bg-gray-100 text-gray-500',
    RESERVE: 'bg-yellow-100 text-yellow-700',
    INDISPONIBLE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#1a3a5c]">{user.name || 'Utilisateur'}</h1>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-[#1a3a5c] text-white rounded-full text-xs font-semibold">
                  {userComplete.role === 'PROPRIETAIRE' ? 'Propriétaire' : 
                   userComplete.role === 'ADMIN' ? 'Administrateur' :
                   userComplete.role === 'SUPER_ADMIN' ? 'Super Admin' :
                   userComplete.role}
                </span>
                {userComplete.status === 'PENDING' && isProprietaire && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Clock size={12} /> En attente de validation
                  </span>
                )}
                {userComplete.status === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Compte vérifié
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message pour propriétaires en attente */}
        {isProprietaire && userComplete.status === 'PENDING' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Clock size={24} className="text-yellow-600 shrink-0" />
              <div>
                <h2 className="font-bold text-yellow-900 mb-1">Compte en attente de validation</h2>
                <p className="text-yellow-800 text-sm mb-3">
                  Votre compte propriétaire est en cours de vérification par notre équipe. 
                  Vous pourrez publier des biens immobiliers une fois votre compte validé.
                </p>
                <p className="text-yellow-700 text-xs">
                  Délai moyen de validation : 24-48 heures
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats pour propriétaires/admins */}
        {canCreateBiens && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Home className="text-blue-600" size={22} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total biens</p>
                    <p className="text-2xl font-bold text-[#1a3a5c]">{stats.total}</p>
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
                    <p className="text-2xl font-bold text-green-600">{stats.publies}</p>
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
                    <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des biens */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-bold text-[#1a3a5c]">Mes biens immobiliers</h2>
                {userComplete.status === 'ACTIVE' && (
                  <Link 
                    href="/dashboard/immobilier/nouveau"
                    className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors text-sm"
                  >
                    <Plus size={16} /> Ajouter un bien
                  </Link>
                )}
              </div>
              <div className="divide-y">
                {biens.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Home size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Aucun bien ajouté</p>
                    <p className="text-sm mt-2">
                      {userComplete.status === 'PENDING' 
                        ? 'Votre compte doit être validé avant de pouvoir ajouter des biens'
                        : 'Commencez par ajouter votre premier bien immobilier'}
                    </p>
                  </div>
                ) : (
                  biens.map((bien: any) => (
                    <Link 
                      key={bien.id}
                      href={`/dashboard/immobilier/${bien.id}`}
                      className="block p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#1a3a5c] truncate">{bien.titre}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[bien.statut]}`}>
                              {bien.statut}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{bien.adresse}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{bien.type}</span>
                            {bien.prixVente && <span>{bien.prixVente.toLocaleString('fr-FR')} FCFA</span>}
                            {bien.prixLoyer && <span>{bien.prixLoyer.toLocaleString('fr-FR')} FCFA/mois</span>}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            {bien.isPublished ? (
                              <>
                                <CheckCircle size={12} className="text-green-500" />
                                <span className="text-green-600">Publié</span>
                              </>
                            ) : (
                              <>
                                <Clock size={12} className="text-yellow-500" />
                                <span className="text-yellow-600">En attente</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{bien._count.demandesVisite} visite(s)</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Message pour clients */}
        {!canCreateBiens && (
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="font-bold text-[#1a3a5c] mb-2">Compte Client</h2>
            <p className="text-gray-500 text-sm">
              Vous avez un compte client. Pour publier des biens immobiliers, 
              vous devez créer un compte propriétaire.
            </p>
            <Link 
              href="/register"
              className="inline-block mt-4 bg-[#e8a020] text-white px-6 py-2 rounded-xl hover:bg-[#d4911d] transition-colors text-sm"
            >
              Créer un compte propriétaire
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
