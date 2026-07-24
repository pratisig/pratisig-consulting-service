import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ShoppingBag, Search, Tag, Truck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string; sous?: string }> }) {
  const sp = await searchParams;

  let produits: any[] = [];
  let categories: any[] = [];
  let countProduits = 0;

  try {
    const results = await Promise.all([
      prisma.produit.findMany({
        where: {
          isActive: true,
          stock: { gt: 0 },
          ...(sp.cat && { categorieId: sp.cat }),
          ...(sp.q && {
            OR: [
              { nom: { contains: sp.q, mode: 'insensitive' } },
              { description: { contains: sp.q, mode: 'insensitive' } },
            ],
          }),
        },
        include: { categorie: true },
        orderBy: { createdAt: 'desc' },
        take: 60,
      }),
      prisma.categorieEcommerce.findMany({
        where: { parentId: null },
        include: {
          sousCategories: {
            include: { _count: { select: { produits: true } } },
          },
          _count: { select: { produits: true } },
        },
        orderBy: { nom: 'asc' },
      }),
      prisma.produit.count({ where: { isActive: true, stock: { gt: 0 } } }),
    ]);
    produits = results[0];
    categories = results[1] as any;
    countProduits = results[2];
  } catch {
    // erreur silencieuse, valeurs par défaut conservées
  }

  // Sous-catégorie sélectionnée
  const selectedSousCat = sp.sous;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a3a5c] to-[#0d2440] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#e8a020] rounded-full flex items-center justify-center font-bold text-white text-lg">P</div>
              <div>
                <h1 className="font-bold text-xl">Pratisig Shop</h1>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  <Truck size={12} /> Livraison à Dakar et régions
                </p>
              </div>
            </div>
            <Link href="/login" className="text-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
              Se connecter
            </Link>
          </div>

          {/* Barre de recherche */}
          <form method="GET" className="max-w-2xl">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={sp.q}
                placeholder="Rechercher un produit..."
                className="w-full pl-12 pr-4 py-3 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e8a020]"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar catégories */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-4">
              <h2 className="font-bold text-[#1a3a5c] mb-3 flex items-center gap-2">
                <Tag size={16} /> Catégories
              </h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/boutique"
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      !sp.cat && !selectedSousCat ? 'bg-[#1a3a5c] text-white font-medium' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Tous les produits
                    <span className="ml-2 text-xs opacity-60">({countProduits})</span>
                  </Link>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <div className={`px-3 py-2 rounded-lg text-sm ${sp.cat === cat.id ? 'bg-[#1a3a5c] text-white' : 'text-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/boutique?cat=${cat.id}`}
                          className="flex-1 font-medium hover:underline"
                        >
                          {cat.nom}
                        </Link>
                        <span className={`text-xs ${sp.cat === cat.id ? 'text-blue-200' : 'text-gray-400'}`}>
                          {cat._count.produits}
                        </span>
                      </div>
                    </div>
                    {sp.cat === cat.id && cat.sousCategories.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                        {cat.sousCategories.map((sous: any) => (
                          <li key={sous.id}>
                            <Link
                              href={`/boutique?cat=${cat.id}&sous=${sous.id}`}
                              className={`block px-2 py-1 text-xs rounded transition-colors ${
                                selectedSousCat === sous.id
                                  ? 'bg-[#e8a020] text-white font-medium'
                                  : 'hover:bg-gray-50 text-gray-600'
                              }`}
                            >
                              {sous.nom}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Liste des produits */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a3a5c]">
                {sp.q ? `Résultats pour "${sp.q}"` : 'Tous les produits'}
              </h2>
              <span className="text-sm text-gray-500">{produits.length} produit{produits.length > 1 ? 's' : ''}</span>
            </div>

            {produits.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-500 mb-4">Aucun produit disponible</p>
                <Link href="/" className="text-[#1a3a5c] font-semibold hover:underline text-sm">
                  Retour à l&apos;accueil
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {produits.map((produit: any) => {
                  const prix = produit.prixPromo && produit.prixPromo < produit.prix ? produit.prixPromo : produit.prix;
                  const hasPromo = produit.prixPromo && produit.prixPromo < produit.prix;
                  const firstImage = produit.images?.[0];

                  return (
                    <Link
                      key={produit.id}
                      href={`/boutique/produit/${produit.slug}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-gray-100"
                    >
                      <div className="relative h-52 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={produit.nom}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={48} className="text-slate-300" />
                          </div>
                        )}
                        {hasPromo && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{Math.round((1 - produit.prixPromo / produit.prix) * 100)}%
                          </span>
                        )}
                        {produit.stock <= 5 && produit.stock > 0 && (
                          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Stock limité
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        {produit.categorie && (
                          <span className="text-xs text-[#1a3a5c] bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                            {produit.categorie.nom}
                          </span>
                        )}
                        <h3 className="font-bold text-[#1a3a5c] text-sm leading-tight mt-2 line-clamp-2">
                          {produit.nom}
                        </h3>
                        {produit.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{produit.description}</p>
                        )}
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-lg font-bold text-[#e8a020]">
                            {prix.toLocaleString('fr-FR')} FCFA
                          </span>
                          {hasPromo && (
                            <span className="text-xs text-gray-400 line-through">
                              {produit.prix.toLocaleString('fr-FR')} F
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a3a5c] text-white py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold">Pratisig Consulting Service</p>
            <p className="text-blue-200 text-sm">Dakar, Sénégal</p>
          </div>
          <div className="text-blue-200 text-sm">
            © {new Date().getFullYear()} Pratisig. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
