'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, MapPin, Phone, Truck, Clock } from 'lucide-react';
import Link from 'next/link';
import LocationSelector from '@/components/shared/LocationSelector';
import { calculateDeliveryPrice, formatPrice, estimateDeliveryTime, formatDuration } from '@/lib/utils/delivery';
import { getErrorMessage } from '@/lib/utils/error';

interface CartItem { id: string; nom: string; prix: number; quantite: number; }

export default function CommanderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fraisLivraison, setFraisLivraison] = useState<number>(0);
  const [dureeEstimee, setDureeEstimee] = useState<number>(0);
  
  const [form, setForm] = useState({
    region: '',
    department: '',
    commune: '',
    quartier: '',
    adresseLivraison: '',
    villeLivraison: 'Dakar',
    telephoneClient: '',
    notesClient: '',
    modePaiement: 'LIVRAISON',
  });

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('pratisig_cart') ?? '[]')); } catch {}
  }, []);

  const sousTotal = cart.reduce((s, l) => s + l.prix * l.quantite, 0);
  const total = sousTotal + fraisLivraison;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleLocationChange(location: {
    region: string;
    department: string;
    commune: string;
    quartier?: string;
  }) {
    setForm(prev => ({
      ...prev,
      region: location.region,
      department: location.department,
      commune: location.commune,
      quartier: location.quartier || '',
      villeLivraison: location.commune || location.department || 'Dakar',
    }));

    // Calculer les frais de livraison
    const zone = location.quartier || location.commune || location.department || location.region;
    const prix = calculateDeliveryPrice(zone);
    setFraisLivraison(prix);
    
    // Estimer la durée (simplifié, basé sur la zone)
    const duree = zone === 'Dakar' || location.region === 'Dakar' ? 30 : 120;
    setDureeEstimee(duree);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Votre panier est vide'); return; }
    
    if (!form.region || !form.commune || !form.adresseLivraison) {
      toast.error('Veuillez compléter votre adresse de livraison');
      return;
    }

    setLoading(true);
    try {
      // Construire l'adresse complète
      const adresseComplete = [
        form.adresseLivraison,
        form.quartier,
        form.commune,
        form.department,
        form.region
      ].filter(Boolean).join(', ');

      const res = await fetch('/api/ecommerce/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telephoneClient: form.telephoneClient,
          adresseLivraison: adresseComplete,
          villeLivraison: form.villeLivraison,
          notesClient: form.notesClient,
          modePaiement: form.modePaiement,
          fraisLivraison,
          lignes: cart.map(l => ({ produitId: l.id, quantite: l.quantite })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      
      localStorage.removeItem('pratisig_cart');
      window.dispatchEvent(new Event('cart-updated'));
      toast.success('🎉 Commande passée avec succès !');
      router.push('/boutique/commande-confirmee');
    } catch (err: any) { 
      toast.error(getErrorMessage(err)); 
    } finally { 
      setLoading(false); 
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <Link href="/boutique" className="bg-[#1a3a5c] text-white px-6 py-2 rounded-xl text-sm font-semibold">
            Aller à la boutique
          </Link>
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
            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone size={13} /> Téléphone *
              </label>
              <input
                name="telephoneClient"
                value={form.telephoneClient}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="+221 77 000 00 00"
              />
            </div>

            {/* Adresse de livraison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={13} /> Adresse de livraison *
              </label>
              <LocationSelector onLocationChange={handleLocationChange} />
            </div>

            {/* Adresse détaillée */}
            {form.commune && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse détaillée *
                </label>
                <input
                  name="adresseLivraison"
                  value={form.adresseLivraison}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="Rue, n°, repère..."
                />
              </div>
            )}

            {/* Mode de paiement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
              <select
                name="modePaiement"
                value={form.modePaiement}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              >
                <option value="LIVRAISON">Paiement à la livraison</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
              <textarea
                name="notesClient"
                value={form.notesClient}
                onChange={handleChange}
                rows={2}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Instructions spéciales..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || fraisLivraison === 0}
              className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              {loading ? 'Commande en cours...' : 'Confirmer la commande'}
            </button>
          </form>

          {/* Résumé */}
          <div className="space-y-4">
            {/* Panier */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold text-[#1a3a5c] mb-4">Votre panier ({cart.length} article{cart.length > 1 ? 's' : ''})</h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.nom} × {item.quantite}</span>
                    <span className="font-semibold text-[#1a3a5c]">
                      {(item.prix * item.quantite).toLocaleString('fr-FR')} F
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Livraison */}
            {fraisLivraison > 0 && (
              <div className="bg-blue-50 rounded-2xl shadow p-6 border border-blue-200">
                <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <Truck size={16} /> Livraison
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zone :</span>
                    <span className="font-semibold text-blue-700">{form.commune || form.department || form.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais :</span>
                    <span className="font-semibold text-blue-700">{formatPrice(fraisLivraison)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Délai estimé :</span>
                    <span className="font-semibold text-blue-700 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(dureeEstimee)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="bg-[#1a3a5c] rounded-2xl shadow p-6 text-white">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Sous-total</span>
                  <span>{sousTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-200">Livraison</span>
                  <span>{fraisLivraison > 0 ? `${fraisLivraison.toLocaleString('fr-FR')} FCFA` : '-'}</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-[#e8a020]">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
