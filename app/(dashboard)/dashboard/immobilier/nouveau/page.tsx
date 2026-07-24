'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Home, MapPin } from 'lucide-react';
import Link from 'next/link';
import LocationSelector from '@/components/shared/LocationSelector';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('@/components/shared/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement de la carte...</p>
    </div>
  ),
});

const TYPES = ['APPARTEMENT','VILLA','STUDIO','BUREAU','COMMERCE','TERRAIN','ENTREPOT'];

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.error === 'string') return e.error;
    if (typeof e.message === 'string') return e.message;
  }
  return 'Une erreur est survenue';
}

export default function NouveauBienPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 14.6937, lon: -17.4467 }); // Dakar par défaut
  const [mapReady, setMapReady] = useState(false);
  
  const [form, setForm] = useState({
    titre: '', description: '', type: 'APPARTEMENT',
    prixLoyer: '', prixVente: '', surface: '',
    nbChambres: '', nbSallesDeBain: '',
    adresse: '', region: '', department: '', commune: '', quartier: '',
    latitude: '', longitude: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleLocationChange(location: {
    region: string;
    department: string;
    commune: string;
    quartier?: string;
    lat?: number;
    lon?: number;
  }) {
    setForm(prev => ({
      ...prev,
      region: location.region,
      department: location.department,
      commune: location.commune,
      quartier: location.quartier || '',
    }));
    
    if (location.lat && location.lon) {
      setCoordinates({ lat: location.lat, lon: location.lon });
      setForm(prev => ({
        ...prev,
        latitude: location.lat?.toString() || '',
        longitude: location.lon?.toString() || '',
      }));
    }
  }

  function handleMapClick(lat: number, lon: number) {
    setCoordinates({ lat, lon });
    setForm(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lon.toFixed(6),
    }));
    setMapReady(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      const adresseComplete = [
        form.adresse,
        form.quartier,
        form.commune,
        form.department,
        form.region,
      ].filter(Boolean).join(', ');

      const payload = {
        titre: form.titre,
        description: form.description,
        type: form.type,
        prixLoyer: form.prixLoyer ? parseFloat(form.prixLoyer) : undefined,
        prixVente: form.prixVente ? parseFloat(form.prixVente) : undefined,
        surface: form.surface ? parseFloat(form.surface) : undefined,
        nbChambres: form.nbChambres ? parseInt(form.nbChambres) : undefined,
        nbSallesDeBain: form.nbSallesDeBain ? parseInt(form.nbSallesDeBain) : undefined,
        adresse: adresseComplete || form.adresse,
        ville: form.commune || form.department || form.region || 'Dakar',
        quartier: form.quartier || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      };

      const res = await fetch('/api/immobilier/biens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Erreur lors de la création du bien');
      }
      
      toast.success('Bien soumis avec succès ! Il sera visible après validation par un administrateur.');
      router.push('/dashboard/immobilier');
    } catch (err: unknown) { 
      toast.error(getErrorMessage(err)); 
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/immobilier" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Ajouter un bien</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c] flex items-center gap-2">
              <Home size={20} /> Informations générales
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input 
                name="titre" 
                value={form.titre} 
                onChange={handleChange} 
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Appartement 3 pièces à Mermoz" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                >
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                <input 
                  name="surface" 
                  type="number" 
                  value={form.surface} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="80" 
                />
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
                  placeholder="150000" 
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
                  placeholder="25000000" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nb. chambres</label>
                <input 
                  name="nbChambres" 
                  type="number" 
                  value={form.nbChambres} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="3" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nb. sdb</label>
                <input 
                  name="nbSallesDeBain" 
                  type="number" 
                  value={form.nbSallesDeBain} 
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="1" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                rows={3}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Bel appartement bien exposé..." 
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c] flex items-center gap-2">
              <MapPin size={20} /> Localisation
            </h2>

            <LocationSelector onLocationChange={handleLocationChange} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse détaillée</label>
              <input 
                name="adresse" 
                value={form.adresse} 
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Rue 10 x 23, Villa n°5" 
              />
            </div>

            {/* Carte interactive - toujours visible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Cliquez sur la carte pour positionner le bien précisément
              </label>
              <InteractiveMap
                lat={coordinates.lat}
                lon={coordinates.lon}
                zoom={14}
                title={form.titre || 'Position du bien'}
                onLocationSelect={handleMapClick}
                showControls={true}
              />
              
              {/* Coordonnées affichées */}
              {form.latitude && form.longitude && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Latitude</p>
                    <p className="text-sm font-mono text-[#1a3a5c]">{form.latitude}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Longitude</p>
                    <p className="text-sm font-mono text-[#1a3a5c]">{form.longitude}</p>
                  </div>
                </div>
              )}
              
              {!mapReady && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 La carte est centrée sur la commune sélectionnée. <strong>Cliquez sur la carte</strong> pour positionner le bien précisément, ou laissez les coordonnées par défaut.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Home size={20} />}
            {loading ? 'Publication...' : 'Publier le bien'}
          </button>
        </form>
      </div>
    </div>
  );
}
