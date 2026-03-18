'use client';
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Produit {
  id: string;
  nom: string;
  prix: number;
  stock: number;
}

export default function AddToCartButton({ produit }: { produit: Produit }) {
  const [quantite, setQuantite] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('pratisig_cart') ?? '[]');
    const existe = cart.find((l: any) => l.id === produit.id);
    let newCart;
    if (existe) {
      newCart = cart.map((l: any) =>
        l.id === produit.id ? { ...l, quantite: Math.min(l.quantite + quantite, produit.stock) } : l
      );
    } else {
      newCart = [...cart, { ...produit, quantite }];
    }
    localStorage.setItem('pratisig_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
    setAdded(true);
    toast.success(`${produit.nom} ajouté au panier !`);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={() => setQuantite(q => Math.max(1, q - 1))}
          className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-[#1a3a5c] transition-colors">
          <Minus size={16} />
        </button>
        <span className="w-12 text-center font-bold text-[#1a3a5c] text-lg">{quantite}</span>
        <button onClick={() => setQuantite(q => Math.min(produit.stock, q + 1))}
          className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-[#1a3a5c] transition-colors">
          <Plus size={16} />
        </button>
        <span className="text-sm text-gray-400">/ {produit.stock} en stock</span>
      </div>

      <button onClick={addToCart}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-[#e8a020] text-white hover:bg-[#d4911d]'
        }`}>
        {added ? <><Check size={18} /> Ajouté !</> : <><ShoppingCart size={18} /> Ajouter au panier</>}
      </button>
    </div>
  );
}
