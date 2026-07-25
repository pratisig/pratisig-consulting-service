'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Categorie {
  id: string;
  nom: string;
}

export default function NouvelArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [form, setForm] = useState({
    nom: '',
    prix: '',
    stock: '0',
    unite: 'unité',
    categorieId: '',
  });

  useEffect(() => {
    // Charger les catégories depuis l'API
    fetch('/api/alimentation/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Erreur chargement catégories:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/alimentation/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          prix: parseFloat(form.prix),
          stock: parseInt(form.stock),
          unite: form.unite,
          categorieId: form.categorieId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création');

      toast.success('Article créé avec succès !');
      router.push('/dashboard/alimentation');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/alimentation" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Nouvel article</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article *</label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Ex: Riz 5kg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
              <input
                name="prix"
                type="number"
                value={form.prix}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="2500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select
                name="unite"
                value={form.unite}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              >
                <option value="unité">Unité</option>
                <option value="kg">Kilogramme (kg)</option>
                <option value="litre">Litre (L)</option>
                <option value="pack">Pack</option>
                <option value="sac">Sac</option>
                <option value="bouteille">Bouteille</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                name="categorieId"
                value={form.categorieId}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              >
                <option value="">Aucune catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">Aucune catégorie disponible</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/dashboard/alimentation"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Création...' : 'Créer l\'article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
