'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/utils/error';

interface Produit {
  id: string;
  nom: string;
  description: string;
  prix: number;
  prixPromo: number | null;
  stock: number;
  isActive: boolean;
  categorieId: string | null;
  categorie: { id: string; nom: string } | null;
}

interface Categorie {
  id: string;
  nom: string;
}

export default function EditProduitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    prix: '',
    prixPromo: '',
    stock: '',
    isActive: true,
    categorieId: '',
  });

  useEffect(() => {
    fetchProduit();
    fetchCategories();
  }, [id]);

  async function fetchProduit() {
    try {
      const res = await fetch(`/api/ecommerce/produits/${id}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setForm({
        nom: data.nom || '',
        description: data.description || '',
        prix: data.prix?.toString() || '',
        prixPromo: data.prixPromo?.toString() || '',
        stock: data.stock?.toString() || '0',
        isActive: data.isActive ?? true,
        categorieId: data.categorieId || '',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
      router.push('/dashboard/ecommerce');
    } finally {
      setFetching(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/ecommerce/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/ecommerce/produits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          description: form.description,
          prix: form.prix,
          prixPromo: form.prixPromo || null,
          stock: form.stock,
          isActive: form.isActive,
          categorieId: form.categorieId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success('Produit mis à jour avec succès !');
      router.push('/dashboard/ecommerce');
    } catch (err) { 
      toast.error(getErrorMessage(err)); 
    } finally { 
      setLoading(false); 
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/ecommerce" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Modifier le produit</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
            <input 
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix promo (FCFA)</label>
              <input 
                name="prixPromo"
                type="number"
                value={form.prixPromo}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input 
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Produit actif (visible dans la boutique)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => router.push('/dashboard/ecommerce')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
