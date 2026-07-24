'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { getCart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount, type CartItem } from '@/lib/utils/cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCart(getCart());

    const handleCartUpdate = () => setCart(getCart());
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const handleQuantityChange = (itemId: string, delta: number) => {
    const item = cart.find(i => i.id === itemId);
    if (item) {
      const newCart = updateQuantity(itemId, item.quantite + delta);
      setCart(newCart);
    }
  };

  const handleRemove = (itemId: string) => {
    const newCart = removeFromCart(itemId);
    setCart(newCart);
  };

  if (!mounted) return null;

  const total = getCartTotal();
  const itemCount = getCartItemCount();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-[#1a3a5c] flex items-center gap-2">
              <ShoppingBag size={20} />
              Mon panier ({itemCount})
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-500 mb-4">Votre panier est vide</p>
                <Link
                  href="/boutique"
                  onClick={onClose}
                  className="text-[#1a3a5c] font-semibold hover:underline text-sm"
                >
                  Continuer mes achats
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                  {item.image ? (
                    <img src={item.image} alt={item.nom} className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#1a3a5c] text-sm truncate">{item.nom}</h3>
                    <p className="text-[#e8a020] font-bold text-sm mt-1">
                      {(item.prix * item.quantite).toLocaleString('fr-FR')} FCFA
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantite}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        disabled={item.quantite >= item.stock}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-[#e8a020]">
                  {total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <Link
                href="/boutique/commander"
                onClick={onClose}
                className="block w-full bg-[#1a3a5c] text-white text-center py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors"
              >
                Passer la commande
              </Link>
              <Link
                href="/boutique"
                onClick={onClose}
                className="block text-center text-sm text-[#1a3a5c] hover:underline"
              >
                Continuer mes achats
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
