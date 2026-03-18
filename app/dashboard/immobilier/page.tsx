import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Home, Plus, MapPin, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ImmobilierPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;

  const isAdmin = ['ADMIN','SUPER_ADMIN','GERANT'].includes(user.role);
  const isProprietaire = user.role === 'PROPRIETAIRE';

  const biens = await prisma.bienImmobilier.findMany({
    where: isAdmin ? {} : isProprietaire ? { proprietaireId: user.id } : { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { proprietaire: { select: { name: true } }, _count: { select: { demandesVisite: true } } },
  }).catch(() => []);

  const STATUT_COLORS: Record<string,string> = {
    DISPONIBLE: 'bg-green-100 text-green-700',
    LOUE: 'bg-blue-100 text-blue-700',
    VENDU: 'bg-gray-100 text-gray-500',
    RESERVE: 'bg-yellow-100 text-yellow-700',
    INDISPONIBLE: 'bg-red-100 text-red-700',
  };

  const TYPE_EMOJI: Record<string,string> = {
    APPARTEMENT:'🏢', VILLA:'🏡', STUDIO:'🚪', BUREAU:'🏛️', COMMERCE:'🏪', TERRAIN:'🌱', ENTREPOT:'🏗️',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Immobilier</h1>
            <p className="text-gray-500 text-sm">
              {isAdmin ? 'Gestion de tous les biens' : isProprietaire ? 'Mes biens' : 'Annonces disponibles'}
            </p>
          </div>
          {(isAdmin || isProprietaire) && (
            <Link href="/dashboard/immobilier/nouveau" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
              <Plus size={16} /> Ajouter un bien
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(biens as any[]).map((bien) => (
            <div key={bien.id} className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-shadow">
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-5xl">{TYPE_EMOJI[bien.type] ?? '🏠'}</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-[#1a3a5c] text-sm leading-tight flex-1 mr-2">{bien.titre}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUT_COLORS[bien.statut]}`}>
                    {bien.statut}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                  <MapPin size={11} />
                  <span>{bien.quartier ?? bien.ville}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {bien.prixLoyer && <p className="font-bold text-[#e8a020]">{bien.prixLoyer.toLocaleString('fr-FR')} F<span className="text-xs text-gray-400">/mois</span></p>}
                    {bien.prixVente && <p className="font-bold text-[#1a3a5c]">{bien.prixVente.toLocaleString('fr-FR')} F</p>}
                  </div>
                  <Link href={`/dashboard/immobilier/${bien.id}`} className="flex items-center gap-1 text-xs text-[#1a3a5c] hover:text-[#e8a020] transition-colors">
                    <Eye size={14} />
                    {bien._count.demandesVisite} visite(s)
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {biens.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Home size={56} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Aucun bien pour le moment</p>
            {(isAdmin || isProprietaire) && (
              <Link href="/dashboard/immobilier/nouveau" className="mt-4 inline-block bg-[#1a3a5c] text-white px-6 py-2 rounded-xl text-sm">
                Ajouter le premier bien
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
