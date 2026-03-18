import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ShoppingCart, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BoutiquePage() {
  let produits: any[] = [];
  try {
    produits = await prisma.produit.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      include: { categorie: true },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
  } catch {
    produits = [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#1a3a5c] text-white px-4 py-4 sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">Pratisig <span className="text-[#e8a020]">Boutique</span></Link>
          <div className="flex items-center gap-3">
            <button className="text-white hover:text-[#e8a020] transition-colors">
              <Search size={20} />
            </button>
            <button className="relative text-white hover:text-[#e8a020] transition-colors">
              <ShoppingCart size={20} />
            </button>
            <Link href="/auth/login" className="text-sm bg-[#e8a020] px-4 py-2 rounded-lg">
              Mon compte
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">Notre Boutique</h1>
        <p className="text-gray-500 mb-8">Paiement sécurisé · Livraison au Sénégal · Wave &amp; Orange Money acceptés</p>

        {produits.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
            <p>La boutique est en cours de préparation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produits.map((p) => (
              <div key={p.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="h-44 bg-slate-100 flex items-center justify-center">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.nom} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart size={36} className="text-slate-300" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400">{p.categorie?.nom}</p>
                  <h3 className="font-semibold text-[#1a3a5c] text-sm mt-1 group-hover:text-[#e8a020] transition-colors">{p.nom}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-[#e8a020]">{p.prix.toLocaleString('fr-FR')} F</p>
                    {p.prixPromo && (
                      <p className="text-xs text-gray-400 line-through">{p.prixPromo.toLocaleString('fr-FR')} F</p>
                    )}
                  </div>
                  <button className="mt-2 w-full bg-[#1a3a5c] text-white py-2 rounded-lg text-xs font-semibold hover:bg-[#0d2440] transition-colors">
                    Ajouter au panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modes de paiement */}
      <section className="bg-white py-8 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm mb-4">Modes de paiement acceptés</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="bg-[#1B9BF0] text-white px-4 py-2 rounded-lg font-bold text-sm">🌊 Wave</span>
            <span className="bg-[#FF6600] text-white px-4 py-2 rounded-lg font-bold text-sm">🟠 Orange Money</span>
            <span className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm">📦 Livraison</span>
          </div>
        </div>
      </section>
    </main>
  );
}
