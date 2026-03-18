'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, MapPin, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function NouvelleLivraisonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    adresseCollecte: '', adresseDest: '',
    latCollecte: '', lngCollecte: '', latDest: '', lngDest: '',
    description: '',
  });
  const [prixEstime, setPrixEstime] = useState<number | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function estimerPrix() {
    // Estimation simplifiée - à enrichir avec les zones
    setPrixEstime(2000);
    toast.info('Prix estimé : 2 000 FCFA (zone par défaut)');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prixEstime) { toast.error('Estimez d\'abord le prix'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/livraison/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          prix: prixEstime,
          latCollecte: form.latCollecte ? parseFloat(form.latCollecte) : undefined,
          lngCollecte: form.lngCollecte ? parseFloat(form.lngCollecte) : undefined,
          latDest: form.latDest ? parseFloat(form.latDest) : undefined,
          lngDest: form.lngDest ? parseFloat(form.lngDest) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      toast.success('Livraison demandée ! Un livreur va accepter.');
      router.push('/dashboard/livraison');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/livraison" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Nouvelle livraison</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-green-600" />
              <span className="font-semibold text-green-700 text-sm">Point de collecte</span>
            </div>
            <input name="adresseCollecte" value={form.adresseCollecte} onChange={handleChange} required
              className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Adresse de prise en charge" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input name="latCollecte" value={form.latCollecte} onChange={handleChange} type="number" step="any"
                className="border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Latitude" />
              <input name="lngCollecte" value={form.lngCollecte} onChange={handleChange} type="number" step="any"
                className="border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Longitude" />
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-red-600" />
              <span className="font-semibold text-red-700 text-sm">Destination</span>
            </div>
            <input name="adresseDest" value={form.adresseDest} onChange={handleChange} required
              className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Adresse de livraison" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input name="latDest" value={form.latDest} onChange={handleChange} type="number" step="any"
                className="border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Latitude" />
              <input name="lngDest" value={form.lngDest} onChange={handleChange} type="number" step="any"
                className="border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="Longitude" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description du colis</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Ex: Documents, vêttements, électronique..." />
          </div>

          {prixEstime === null ? (
            <button type="button" onClick={estimerPrix}
              className="w-full border-2 border-[#1a3a5c] text-[#1a3a5c] py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              📊 Estimer le prix
            </button>
          ) : (
            <div className="bg-[#1a3a5c] text-white rounded-xl p-4 text-center">
              <p className="text-sm">Prix estimé</p>
              <p className="text-3xl font-bold text-[#e8a020]">{prixEstime.toLocaleString('fr-FR')} FCFA</p>
            </div>
          )}

          <button type="submit" disabled={loading || prixEstime === null}
            className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Commander la livraison
          </button>
        </form>
      </div>
    </div>
  );
}
