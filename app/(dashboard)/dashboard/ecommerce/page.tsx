import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import Link from 'next/link';
import { Package, ShoppingBag, Plus, Eye, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EcommerceDashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;
  if (!hasPermission(user.role, 'ecommerce:manage')) redirect('/auth/unauthorized');

  const [produits, commandes, statsCommandes] = await Promise.all([
    prisma.produit.findMany({ where: { isActive: true }, include: { categorie: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.commande.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { client: { select: { name: true, email: true } } } }),
    prisma.commande.groupBy({ by: ['statut'], _count: { id: true } }),
  ]).catch(() => [[], [], []]);

  const totalCA = (commandes as any[]).filter(c => c.statut === 'LIVREE').reduce((s: number, c: any) => s + c.total, 0);

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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">E-commerce Admin</h1>
            <p className="text-gray-500 text-sm">Gestion boutique &amp; commandes</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/ecommerce/produits/nouveau" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
              <Plus size={16} /> Nouveau produit
            </Link>
            <Link href="/boutique" target="_blank" className="border border-[#1a3a5c] text-[#1a3a5c] px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-colors">
              <Eye size={16} /> Voir la boutique
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <p className="text-3xl font-bold text-[#1a3a5c]">{(produits as any[]).length}</p>
            <p className="text-sm text-gray-500 mt-1">Produits actifs</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <p className="text-3xl font-bold text-[#1a3a5c]">{(commandes as any[]).length}</p>
            <p className="text-sm text-gray-500 mt-1">Commandes</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <p className="text-3xl font-bold text-[#e8a020]">{(commandes as any[]).filter((c:any)=>c.statut==='EN_ATTENTE').length}</p>
            <p className="text-sm text-gray-500 mt-1">En attente</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow text-center">
            <p className="text-2xl font-bold text-green-600">{totalCA.toLocaleString('fr-FR')} F</p>
            <p className="text-sm text-gray-500 mt-1">CA livré</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commandes récentes */}
          <div className="bg-white rounded-2xl shadow">
            <div className="p-4 border-b flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#1a3a5c]" />
              <h2 className="font-semibold text-[#1a3a5c]">Commandes récentes</h2>
            </div>
            <div className="divide-y">
              {(commandes as any[]).slice(0, 8).map((cmd) => (
                <div key={cmd.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1a3a5c] text-sm">{cmd.client?.name ?? cmd.telephoneClient}</p>
                    <p className="text-xs text-gray-400">{new Date(cmd.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[cmd.statut] ?? 'bg-gray-100'}`}>{cmd.statut.replace('_',' ')}</span>
                    <span className="font-bold text-[#e8a020] text-sm">{cmd.total.toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Produits */}
          <div className="bg-white rounded-2xl shadow">
            <div className="p-4 border-b flex items-center gap-2">
              <Package size={18} className="text-[#1a3a5c]" />
              <h2 className="font-semibold text-[#1a3a5c]">Produits</h2>
            </div>
            <div className="divide-y">
              {(produits as any[]).slice(0, 8).map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1a3a5c] text-sm">{p.nom}</p>
                    <p className="text-xs text-gray-400">{p.categorie?.nom}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      p.stock > 10 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>Stock: {p.stock}</span>
                    <span className="font-bold text-[#e8a020] text-sm">{p.prix.toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
