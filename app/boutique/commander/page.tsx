'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

interface CartItem { id: string; nom: string; prix: number; quantite: number; }

const QUARTIERS = ['Plateau','Médina','Ouakam','Almadies','Ngor','Mermoz','Sacré-Cœur','Yoff','Pikine','Guédiawaye','Parcelles Assainies','Autre'];

export default function CommanderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    adresseLivraison: '', villeLivraison: 'Dakar',
    telephoneClient: '', notesClient: '', modePaiement: 'LIVRAISON',
  });

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('pratisig_cart') ?? '[]')); } catch {}
  }, []);

  const total = cart.reduce((s, l) => s + l.prix * l.quantite, 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Votre panier est vide'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/ecommerce/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lignes: cart.map(l => ({ produitId: l.id, quantite: l.quantite })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      localStorage.removeItem('pratisig_cart');
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('🎉 Commande passée avec succès !');
      router.push('/boutique/commande-confirmee');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <Link href="/boutique" className="bg-[#1a3a5c] text-white px-6 py-2 rounded-xl text-sm font-semibold">Aller à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1a3a5c] mb-6">Finaliser la commande</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone size={13} /> Téléphone *</label>
              <input name="telephoneClient" value={form.telephoneClient} onChange={handleChange} required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="+221 77 000 00 00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={13} /> Adresse de livraison *</label>
              <input name="adresseLivraison" value={form.adresseLivraison} onChange={handleChange} required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Rue 10, Mermoz, Dakar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartier/Ville *</label>
              <select name="villeLivraison" value={form.villeLivraison} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
                {QUARTIERS.map(q => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
              <select name="modePaiement" value={form.modePaiement} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
                <option value="LIVRAISON">Paiement à la livraison</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notesClient" value={form.notesClient} onChange={handleChange} rows={2}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Instructions pour la livraison..." />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              Confirmer la commande
            </button>
          </form>

          {/* Récap commande */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4">Récapitulatif</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.nom} <span className="text-gray-400">×{item.quantite}</span></span>
                  <span className="font-semibold text-[#1a3a5c]">{(item.prix * item.quantite).toLocaleString('fr-FR')} F</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-bold text-[#1a3a5c]">Total</span>
              <span className="font-bold text-2xl text-[#e8a020]">{total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
