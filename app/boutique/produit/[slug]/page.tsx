import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Tag, Package, Truck, CheckCircle } from 'lucide-react';
import AddToCartButton from '@/components/boutique/AddToCartButton';

export const dynamic = 'force-dynamic';

export default async function DetailProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produit = await prisma.produit.findUnique({
    where: { slug },
    include: { categorie: true },
  });
  if (!produit || !produit.isActive) notFound();

  const produitsRelies = await prisma.produit.findMany({
    where: { categorieId: produit.categorieId, isActive: true, NOT: { id: produit.id } },
    take: 4,
  });

  const prix = produit.prixPromo && produit.prixPromo < produit.prix ? produit.prixPromo : produit.prix;
  const hasPromo = produit.prixPromo && produit.prixPromo < produit.prix;

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
          {/* Galerie d'images */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow overflow-hidden h-96">
              {produit.images?.[0] ? (
                <img
                  src={produit.images[0]}
                  alt={produit.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <ShoppingCart size={72} className="text-slate-300" />
                </div>
              )}
            </div>
            {produit.images && produit.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {produit.images.slice(1, 5).map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={img} alt={`${produit.nom} ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div className="space-y-5">
            {produit.categorie && (
              <Link href={`/boutique?cat=${produit.categorieId}`}
                className="inline-flex items-center gap-1 text-xs text-[#1a3a5c] bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                <Tag size={11} /> {produit.categorie.nom}
              </Link>
            )}

            <h1 className="text-3xl font-bold text-[#1a3a5c]">{produit.nom}</h1>

            {/* Prix */}
            <div className="bg-gradient-to-r from-[#e8a020]/10 to-[#e8a020]/5 rounded-2xl p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-[#e8a020]">{prix.toLocaleString('fr-FR')} FCFA</span>
                {hasPromo && (
                  <span className="text-xl text-gray-400 line-through">{produit.prix.toLocaleString('fr-FR')} FCFA</span>
                )}
              </div>
              {hasPromo && (
                <span className="inline-block mt-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  🔥 -{Math.round((1 - produit.prixPromo! / produit.prix) * 100)}% de réduction
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className={produit.stock > 0 ? 'text-green-500' : 'text-red-500'} />
              <span className={`text-sm font-medium ${produit.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {produit.stock > 10
                  ? 'En stock'
                  : produit.stock > 0
                  ? `Plus que ${produit.stock} en stock !`
                  : 'Rupture de stock'}
              </span>
            </div>

            {/* Description */}
            {produit.description && (
              <div>
                <h3 className="font-semibold text-[#1a3a5c] mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{produit.description}</p>
              </div>
            )}

            {/* Livraison */}
            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
              <Truck size={18} className="text-[#1a3a5c]" />
              <div>
                <p className="text-xs font-medium text-[#1a3a5c]">Livraison disponible</p>
                <p className="text-xs text-gray-500">Dakar et régions du Sénégal</p>
              </div>
            </div>

            {/* Bouton ajout panier */}
            {produit.stock > 0 ? (
              <AddToCartButton produit={{
                id: produit.id,
                nom: produit.nom,
                prix,
                stock: produit.stock,
              }} />
            ) : (
              <div className="bg-red-50 text-red-700 text-center py-3 rounded-xl font-semibold">
                Produit indisponible
              </div>
            )}

            <Link href="/login?redirect=/boutique" className="block text-center text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors">
              Se connecter pour commander
            </Link>
          </div>
        </div>

        {/* Produits similaires */}
        {produitsRelies.length > 0 && (
          <div>
            <h2 className="font-bold text-[#1a3a5c] text-lg mb-4">Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {produitsRelies.map((p: any) => {
                const pPrix = p.prixPromo && p.prixPromo < p.prix ? p.prixPromo : p.prix;
                return (
                  <Link key={p.id} href={`/boutique/produit/${p.slug}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="h-36 bg-slate-100 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart size={32} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-[#1a3a5c] text-xs leading-tight line-clamp-2 mb-2">{p.nom}</p>
                      <p className="text-[#e8a020] font-bold text-sm">{pPrix.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
