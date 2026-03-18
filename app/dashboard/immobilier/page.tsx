import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import Link from 'next/link';
import { Home, Plus, MapPin, Eye, Edit } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardImmobilierPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;
  if (!hasPermission(user.role, 'immobilier:create')) redirect('/auth/unauthorized');

  const biens = await prisma.bienImmobilier.findMany({
    where: user.role === 'PROPRIETAIRE' ? { proprietaireId: user.id } : {},
    orderBy: { createdAt: 'desc' },
    include: { proprietaire: { select: { name: true } } },
  }).catch(() => []);

  const stats = {
    total: biens.length,
    disponibles: biens.filter((b: any) => b.statut === 'DISPONIBLE').length,
    loues: biens.filter((b: any) => b.statut === 'LOUE').length,
    vendus: biens.filter((b: any) => b.statut === 'VENDU').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Gestion Immobilière</h1>
            <p className="text-gray-500 text-sm">Gérez vos biens et demandes</p>
          </div>
          <Link href="/dashboard/immobilier/nouveau" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
            <Plus size={16} /> Nouveau bien
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ label: 'Total', val: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Disponibles', val: stats.disponibles, color: 'bg-green-50 text-green-700' },
            { label: 'Loués', val: stats.loues, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Vendus', val: stats.vendus, color: 'bg-gray-50 text-gray-700' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <p className="text-3xl font-bold">{s.val}</p>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Liste biens */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2">
            <Home size={18} className="text-[#1a3a5c]" />
            <h2 className="font-semibold text-[#1a3a5c]">Liste des biens</h2>
          </div>
          {biens.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Home size={48} className="mx-auto mb-4 opacity-30" />
              <p>Aucun bien enregistré</p>
            </div>
          ) : (
            <div className="divide-y">
              {biens.map((bien: any) => (
                <div key={bien.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Home size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a3a5c]">{bien.titre}</p>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin size={10} /> {bien.ville}{bien.quartier ? `, ${bien.quartier}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      bien.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                      bien.statut === 'LOUE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{bien.statut}</span>
                    <p className="font-bold text-[#e8a020] text-sm">{bien.prix.toLocaleString('fr-FR')} F</p>
                    <Link href={`/immobilier/${bien.id}`} className="text-gray-400 hover:text-[#1a3a5c]"><Eye size={16} /></Link>
                    <Link href={`/dashboard/immobilier/${bien.id}/edit`} className="text-gray-400 hover:text-[#1a3a5c]"><Edit size={16} /></Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
