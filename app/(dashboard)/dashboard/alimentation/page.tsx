import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import Link from 'next/link';
import { ShoppingCart, Package, Plus, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AlimentationPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;
  if (!hasPermission(user.role, 'alimentation:sell')) redirect('/auth/unauthorized');

  const today = new Date(); today.setHours(0,0,0,0);

  const [articles, ventesAujourdhui, totalVentes] = await Promise.all([
    prisma.articleAlimentation.findMany({ where: { isActive: true }, include: { categorie: true }, orderBy: { nom: 'asc' }, take: 50 }),
    prisma.venteAlimentation.count({ where: { createdAt: { gte: today } } }),
    prisma.venteAlimentation.aggregate({ _sum: { total: true }, where: { createdAt: { gte: today }, statut: 'FERMEE' } }),
  ]).catch(() => [[], 0, { _sum: { total: null } }]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Alimentation Générale</h1>
            <p className="text-gray-500 text-sm">Caisse &amp; gestion des articles</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/alimentation/caisse" className="bg-[#e8a020] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#d4911d] transition-colors">
              <ShoppingCart size={16} /> Ouvrir la caisse
            </Link>
            {hasPermission(user.role, 'alimentation:manage') && (
              <Link href="/dashboard/alimentation/articles/nouveau" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
                <Plus size={16} /> Nouvel article
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><TrendingUp className="text-green-600" size={18} /></div>
              <div>
                <p className="text-gray-500 text-sm">Ventes aujourd'hui</p>
                <p className="text-2xl font-bold text-[#1a3a5c]">{ventesAujourdhui as number}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center"><ShoppingCart className="text-yellow-600" size={18} /></div>
              <div>
                <p className="text-gray-500 text-sm">Recette du jour</p>
                <p className="text-2xl font-bold text-[#1a3a5c]">{((totalVentes as any)?._sum?.total ?? 0).toLocaleString('fr-FR')} F</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Package className="text-blue-600" size={18} /></div>
              <div>
                <p className="text-gray-500 text-sm">Articles en stock</p>
                <p className="text-2xl font-bold text-[#1a3a5c]">{(articles as any[]).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2">
            <Package size={18} className="text-[#1a3a5c]" />
            <h2 className="font-semibold text-[#1a3a5c]">Catalogue articles</h2>
          </div>
          <div className="divide-y">
            {(articles as any[]).map((art) => (
              <div key={art.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-[#1a3a5c]">{art.nom}</p>
                  <p className="text-xs text-gray-400">{art.categorie?.nom}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    art.stock > 10 ? 'bg-green-100 text-green-700' :
                    art.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>{art.stock} {art.unite}</span>
                  <p className="font-bold text-[#e8a020]">{art.prix.toLocaleString('fr-FR')} F</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
