'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const TYPES = ['APPARTEMENT','MAISON','VILLA','TERRAIN','BUREAU','COMMERCE','ENTREPOT'];
const TRANSACTIONS = ['LOCATION','VENTE','GERANCE'];

export default function NouveauBienPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: '', description: '', type: 'APPARTEMENT', transactionType: 'LOCATION',
    prix: '', surface: '', nbChambres: '', adresse: '', ville: 'Dakar', quartier: '',
    latitude: '', longitude: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/immobilier/biens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          prix: parseFloat(form.prix),
          surface: form.surface ? parseFloat(form.surface) : undefined,
          nbChambres: form.nbChambres ? parseInt(form.nbChambres) : undefined,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      toast.success('Bien créé avec succès !');
      router.push('/dashboard/immobilier');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/immobilier" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Nouveau bien</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input name="titre" value={form.titre} onChange={handleChange} required className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="Belle villa à Almadies" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien *</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de transaction *</label>
              <select name="transactionType" value={form.transactionType} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
                {TRANSACTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
              <input name="prix" type="number" value={form.prix} onChange={handleChange} required className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="150000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
              <input name="surface" type="number" value={form.surface} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="120" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
              <input name="nbChambres" type="number" value={form.nbChambres} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <input name="ville" value={form.ville} onChange={handleChange} required className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
              <input name="quartier" value={form.quartier} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="Almadies" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input name="adresse" value={form.adresse} onChange={handleChange} required className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="Rue 12, Almadies, Dakar" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude GPS</label>
              <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="14.7167" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude GPS</label>
              <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="-17.4677" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="Décrivez le bien en détail..." />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Enregistrer le bien
          </button>
        </form>
      </div>
    </div>
  );
}
