// Système de panier persistant avec localStorage
export interface CartItem {
  id: string;
  nom: string;
  prix: number;
  image?: string;
  quantite: number;
  stock: number;
}

const CART_KEY = 'pratisig_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Déclencher un événement pour mettre à jour les composants
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item: Omit<CartItem, 'quantite'>, quantite: number = 1): CartItem[] {
  const cart = getCart();
  const existingIndex = cart.findIndex(i => i.id === item.id);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantite += quantite;
  } else {
    cart.push({ ...item, quantite });
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(itemId: string): CartItem[] {
  const cart = getCart().filter(i => i.id !== itemId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(itemId: string, quantite: number): CartItem[] {
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  
  if (item) {
    if (quantite <= 0) {
      return removeFromCart(itemId);
    }
    item.quantite = Math.min(quantite, item.stock);
  }
  
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartTotal(): number {
  return getCart().reduce((total, item) => total + item.prix * item.quantite, 0);
}

export function getCartItemCount(): number {
  return getCart().reduce((count, item) => count + item.quantite, 0);
}
