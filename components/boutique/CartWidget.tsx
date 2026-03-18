'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: string; nom: string; prix: number; quantite: number; stock: number;
}

export default function CartWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  function loadCart() {
    try {
      setCart(JSON.parse(localStorage.getItem('pratisig_cart') ?? '[]'));
    } catch { setCart([]); }
  }

  useEffect(() => {
    loadCart();
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, []);

  function updateQte(id: string, delta: number) {
    const newCart = cart.map(l =>
      l.id === id ? { ...l, quantite: Math.max(1, Math.min(l.stock, l.quantite + delta)) } : l
    ).filter(l => l.quantite > 0);
    setCart(newCart);
    localStorage.setItem('pratisig_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  }

  function removeItem(id: string) {
    const newCart = cart.filter(l => l.id !== id);
    setCart(newCart);
    localStorage.setItem('pratisig_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  }

  const total = cart.reduce((s, l) => s + l.prix * l.quantite, 0);
  const count = cart.reduce((s, l) => s + l.quantite, 0);

  return (
    <>
      {/* Bouton panier flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#e8a020] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-[#d4911d] transition-all hover:scale-105 z-40"
      >
        <ShoppingCart size={22} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Drawer panier */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-[#1a3a5c] flex items-center gap-2">
                <ShoppingCart size={18} /> Panier ({count})
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Votre panier est vide</p>
                  <Link href="/boutique" onClick={() => setIsOpen(false)}
                    className="mt-3 inline-block text-sm text-[#1a3a5c] underline">Découvrir la boutique</Link>
                </div>
              ) : cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                    <ShoppingCart size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a3a5c] text-xs truncate">{item.nom}</p>
                    <p className="text-[#e8a020] font-bold text-sm">{(item.prix * item.quantite).toLocaleString('fr-FR')} F</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQte(item.id, -1)} className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                      <Minus size={10} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{item.quantite}</span>
                    <button onClick={() => updateQte(item.id, 1)} className="w-6 h-6 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center">
                      <Plus size={10} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1a3a5c]">Total</span>
                  <span className="font-bold text-2xl text-[#e8a020]">{total.toLocaleString('fr-FR')} F</span>
                </div>
                <Link href="/boutique/commander"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-[#1a3a5c] text-white py-3 rounded-xl text-center font-semibold hover:bg-[#0d2440] transition-colors">
                  Passer la commande
                </Link>
                <button onClick={() => { localStorage.removeItem('pratisig_cart'); loadCart(); }}
                  className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors">
                  Vider le panier
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
