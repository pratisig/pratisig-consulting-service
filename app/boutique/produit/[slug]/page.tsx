import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Tag, Package } from 'lucide-react';
import AddToCartButton from '@/components/boutique/AddToCartButton';

export const dynamic = 'force-dynamic';

export default async function DetailProduitPage({ params }: { params: { slug: string } }) {
  const produit = await prisma.produit.findUnique({
    where: { slug: params.slug },
    include: { categorie: true },
  });
  if (!produit || !produit.isActive) notFound();

  const produitsRelies = await prisma.produit.findMany({
    where: { categorieId: produit.categorieId, isActive: true, NOT: { id: produit.id } },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#e8a020] rounded-full flex items-center justify-center font-bold text-sm">P</div>
            <span className="font-bold text-sm">Pratisig Shop</span>
          </div>
          <Link href="/boutique" className="text-blue-200 hover:text-white text-sm flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Boutique
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="bg-white rounded-2xl shadow h-72 flex items-center justify-center">
            <ShoppingCart size={72} className="text-slate-200" />
          </div>

          {/* Infos */}
          <div className="space-y-4">
            {produit.categorie && (
              <Link href={`/boutique?cat=${produit.categorieId}`}
                className="inline-flex items-center gap-1 text-xs text-[#1a3a5c] bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                <Tag size={11} /> {produit.categorie.nom}
              </Link>
            )}

            <h1 className="text-2xl font-bold text-[#1a3a5c]">{produit.nom}</h1>

            <div className="flex items-center gap-3">
              {produit.prixPromo ? (
                <>
                  <span className="text-3xl font-bold text-[#e8a020]">{produit.prixPromo.toLocaleString('fr-FR')} FCFA</span>
                  <span className="text-lg text-gray-400 line-through">{produit.prix.toLocaleString('fr-FR')} FCFA</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    -{Math.round((1 - produit.prixPromo / produit.prix) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[#e8a020]">{produit.prix.toLocaleString('fr-FR')} FCFA</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Package size={16} className={produit.stock > 0 ? 'text-green-500' : 'text-red-500'} />
              <span className={`text-sm font-medium ${produit.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {produit.stock > 0 ? `En stock (${produit.stock} disponibles)` : 'Rupture de stock'}
              </span>
            </div>

            {produit.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{produit.description}</p>
            )}

            {produit.stock > 0 && (
              <AddToCartButton produit={{
                id: produit.id,
                nom: produit.nom,
                prix: produit.prixPromo ?? produit.prix,
                stock: produit.stock,
              }} />
            )}

            <Link href="/auth/login?redirect=/boutique" className="block text-center border-2 border-[#1a3a5c] text-[#1a3a5c] py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Se connecter pour commander
            </Link>
          </div>
        </div>

        {/* Produits reliés */}
        {produitsRelies.length > 0 && (
          <div>
            <h2 className="font-bold text-[#1a3a5c] text-lg mb-4">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {produitsRelies.map((p) => (
                <Link key={p.id} href={`/boutique/produit/${p.slug}`}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="h-24 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                    <ShoppingCart size={24} className="text-slate-300" />
                  </div>
                  <p className="font-semibold text-[#1a3a5c] text-xs line-clamp-2">{p.nom}</p>
                  <p className="text-[#e8a020] font-bold text-sm mt-1">{(p.prixPromo ?? p.prix).toLocaleString('fr-FR')} F</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
