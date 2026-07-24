'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/utils/error';

export default function EditBienPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    type: 'APPARTEMENT',
    statut: 'DISPONIBLE',
    prixLoyer: '',
    prixVente: '',
    surface: '',
    nbChambres: '',
    nbSallesDeBain: '',
    adresse: '',
    ville: '',
    quartier: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchBien();
  }, [id]);

  async function fetchBien() {
    try {
      const res = await fetch(`/api/immobilier/biens/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Bien non trouvé');
      }

      setForm({
        titre: data.titre || '',
        description: data.description || '',
        type: data.type || 'APPARTEMENT',
        statut: data.statut || 'DISPONIBLE',
        prixLoyer: data.prixLoyer?.toString() || '',
        prixVente: data.prixVente?.toString() || '',
        surface: data.surface?.toString() || '',
        nbChambres: data.nbChambres?.toString() || '',
        nbSallesDeBain: data.nbSallesDeBain?.toString() || '',
        adresse: data.adresse || '',
        ville: data.ville || '',
        quartier: data.quartier || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
      });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      router.push('/dashboard/immobilier');
    } finally {
      setFetching(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        titre: form.titre,
        description: form.description,
        type: form.type,
        statut: form.statut,
        prixLoyer: form.prixLoyer ? parseFloat(form.prixLoyer) : null,
        prixVente: form.prixVente ? parseFloat(form.prixVente) : null,
        surface: form.surface ? parseFloat(form.surface) : null,
        nbChambres: form.nbChambres ? parseInt(form.nbChambres) : null,
        nbSallesDeBain: form.nbSallesDeBain ? parseInt(form.nbSallesDeBain) : null,
        adresse: form.adresse,
        ville: form.ville,
        quartier: form.quartier || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      const res = await fetch(`/api/immobilier/biens/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Erreur lors de la mise à jour');
      }
      
      toast.success('Bien mis à jour avec succès !');
      router.push('/dashboard/immobilier');
    } catch (err: unknown) { 
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/immobilier" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Modifier le bien</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c]">Informations générales</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input 
                name="titre" 
                value={form.titre} 
                onChange={handleChange} 
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                >
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio</option>
                  <option value="BUREAU">Bureau</option>
                  <option value="COMMERCE">Commerce</option>
                  <option value="TERRAIN">Terrain</option>
                  <option value="ENTREPOT">Entrepôt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select 
                  name="statut" 
                  value={form.statut} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="LOUE">Loué</option>
                  <option value="VENDU">Vendu</option>
                  <option value="RESERVE">Réservé</option>
                  <option value="INDISPONIBLE">Indisponible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix loyer (FCFA/mois)</label>
                <input 
                  name="prixLoyer" 
                  type="number" 
                  value={form.prixLoyer} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix vente (FCFA)</label>
                <input 
                  name="prixVente" 
                  type="number" 
                  value={form.prixVente} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                <input 
                  name="surface" 
                  type="number" 
                  value={form.surface} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                <input 
                  name="nbChambres" 
                  type="number" 
                  value={form.nbChambres} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                <input 
                  name="nbSallesDeBain" 
                  type="number" 
                  value={form.nbSallesDeBain} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
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
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c]">Localisation</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
              <input 
                name="adresse" 
                value={form.adresse} 
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input 
                  name="ville" 
                  value={form.ville} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                <input 
                  name="quartier" 
                  value={form.quartier} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input 
                  name="latitude" 
                  type="number"
                  step="any"
                  value={form.latitude} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input 
                  name="longitude" 
                  type="number"
                  step="any"
                  value={form.longitude} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => router.push('/dashboard/immobilier')}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
