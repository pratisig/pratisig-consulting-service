'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

const TYPES = ['APPARTEMENT','VILLA','STUDIO','BUREAU','COMMERCE','TERRAIN','ENTREPOT'];
const QUARTIERS_DAKAR = ['Plateau','Médina','Ouakam','Almadies','Ngor','Mermoz','Sacré-Coeur','Yoff','Pikine','Guédiawaye','Parcelles Assainies'];

export default function NouveauBienPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: '', description: '', type: 'APPARTEMENT',
    prixLoyer: '', prixVente: '', surface: '',
    nbChambres: '', nbSallesDeBain: '',
    adresse: '', quartier: '', ville: 'Dakar',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        prixLoyer: form.prixLoyer ? parseFloat(form.prixLoyer) : undefined,
        prixVente: form.prixVente ? parseFloat(form.prixVente) : undefined,
        surface: form.surface ? parseFloat(form.surface) : undefined,
        nbChambres: form.nbChambres ? parseInt(form.nbChambres) : undefined,
        nbSallesDeBain: form.nbSallesDeBain ? parseInt(form.nbSallesDeBain) : undefined,
      };
      const res = await fetch('/api/immobilier/biens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      toast.success('Bien ajouté avec succès !');
      router.push('/dashboard/immobilier');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/immobilier" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Ajouter un bien</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input name="titre" value={form.titre} onChange={handleChange} required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Appartement 3 pièces à Mermoz" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
              <input name="surface" type="number" value={form.surface} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="80" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix loyer (FCFA/mois)</label>
              <input name="prixLoyer" type="number" value={form.prixLoyer} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="150000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix vente (FCFA)</label>
              <input name="prixVente" type="number" value={form.prixVente} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="25000000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nb. chambres</label>
              <input name="nbChambres" type="number" value={form.nbChambres} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nb. sdb</label>
              <input name="nbSallesDeBain" type="number" value={form.nbSallesDeBain} onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="1" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
            <select name="quartier" value={form.quartier} onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
              <option value="">Sélectionner...</option>
              {QUARTIERS_DAKAR.map(q => <option key={q}>{q}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète *</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Rue 10 x 23, Mermoz, Dakar" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Bel appartement bien exposé..." />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Home size={18} />}
            Publier le bien
          </button>
        </form>
      </div>
    </div>
  );
}
