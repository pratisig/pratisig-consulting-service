'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { getCartItemCount } from '@/lib/utils/cart';
import CartDrawer from '@/components/boutique/CartDrawer';

export default function CartButton() {
  const [itemCount, setItemCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItemCount(getCartItemCount());

    const handleCartUpdate = () => setItemCount(getCartItemCount());
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <ShoppingCart size={20} className="text-white" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#e8a020] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
