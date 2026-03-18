import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ShoppingBag, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BoutiquePage({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const [produits, categories] = await Promise.all([
    prisma.produit.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        ...(searchParams.cat && { categorieId: searchParams.cat }),
        ...(searchParams.q && { nom: { contains: searchParams.q, mode: 'insensitive' } }),
      },
      include: { categorie: true },
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
    prisma.categorieEcommerce.findMany({ orderBy: { nom: 'asc' } }),
  ]).catch(() => [[], []]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header boutique */}
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e8a020] rounded-full flex items-center justify-center font-bold">P</div>
            <div>
              <p className="font-bold text-sm">Pratisig Shop</p>
              <p className="text-blue-200 text-xs">Livraison à Dakar</p>
            </div>
          </div>
          <Link href="/auth/login" className="text-sm text-blue-200 hover:text-white transition-colors">
            Se connecter
          </Link>
        </div>
      </header>

      {/* Search + filtres */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-3 overflow-x-auto">
          <form method="GET" className="flex gap-2 flex-1 min-w-0">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="q" defaultValue={searchParams.q}
                className="w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Rechercher un produit..." />
            </div>
            <button type="submit" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl text-sm">Chercher</button>
          </form>
        </div>
        {/* Catégories */}
        <div className="max-w-6xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto">
          <Link href="/boutique" className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            !searchParams.cat ? 'bg-[#1a3a5c] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
          }`}>Tout</Link>
          {(categories as any[]).map((cat) => (
            <Link key={cat.id} href={`/boutique?cat=${cat.id}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                searchParams.cat === cat.id ? 'bg-[#1a3a5c] text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}>{cat.nom}</Link>
          ))}
        </div>
      </div>

      {/* Produits */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {(produits as any[]).length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag size={56} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">Aucun produit disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(produits as any[]).map((produit) => (
              <Link key={produit.id} href={`/boutique/produit/${produit.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                {/* Image placeholder */}
                <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-50 transition-all">
                  <ShoppingBag size={36} className="text-slate-300" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-[#1a3a5c] text-sm leading-tight line-clamp-2 mb-2">{produit.nom}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      {produit.prixPromo ? (
                        <>
                          <span className="text-[#e8a020] font-bold text-sm">{produit.prixPromo.toLocaleString('fr-FR')} F</span>
                          <span className="text-gray-400 text-xs line-through ml-1">{produit.prix.toLocaleString('fr-FR')} F</span>
                        </>
                      ) : (
                        <span className="text-[#e8a020] font-bold text-sm">{produit.prix.toLocaleString('fr-FR')} F</span>
                      )}
                    </div>
                    {produit.stock <= 5 && produit.stock > 0 && (
                      <span className="text-orange-500 text-xs">Presque épuisé</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-gray-400 text-xs py-8">
        <p>Pratisig Consulting Service © {new Date().getFullYear()} — Dakar, Sénégal</p>
      </footer>
    </div>
  );
}
