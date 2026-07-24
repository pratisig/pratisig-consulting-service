'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import LocationCascade from '@/components/shared/LocationCascade';
import { calculatePriceByDistance, formatPrice, calculateDistance } from '@/lib/utils/delivery';

export default function NouvelleLivraisonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  interface LocationData {
    region: string;
    department: string;
    commune: string;
    quartier?: string;
    adresse?: string;
    lat: number;
    lon: number;
  }

  const [collecte, setCollecte] = useState<LocationData>({
    region: '',
    department: '',
    commune: '',
    lat: 0,
    lon: 0,
  });
  const [destination, setDestination] = useState<LocationData>({
    region: '',
    department: '',
    commune: '',
    lat: 0,
    lon: 0,
  });
  const [description, setDescription] = useState('');
  const [prixEstime, setPrixEstime] = useState<number | null>(null);
  const [distanceEstimee, setDistanceEstimee] = useState<number | null>(null);

  const handleCollecteChange = (loc: LocationData) => {
    setCollecte(loc);
    calculateEstimation(loc, destination);
  };

  const handleDestinationChange = (loc: LocationData) => {
    setDestination(loc);
    calculateEstimation(collecte, loc);
  };

  const calculateEstimation = (
    from: { lat: number; lon: number },
    to: { lat: number; lon: number }
  ) => {
    if (from.lat && from.lon && to.lat && to.lon) {
      const distance = calculateDistance(from.lat, from.lon, to.lat, to.lon);
      const prix = calculatePriceByDistance(distance);
      setDistanceEstimee(distance);
      setPrixEstime(prix);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collecte.lat || !collecte.lon || !destination.lat || !destination.lon) {
      toast.error('Veuillez sélectionner les localisations complètes');
      return;
    }

    if (!prixEstime) {
      toast.error('Veuillez calculer le prix estimatif');
      return;
    }

    setLoading(true);

    try {
      const adresseCollecte = [
        collecte.adresse,
        collecte.quartier,
        collecte.commune,
        collecte.department,
        collecte.region,
      ].filter((v): v is string => typeof v === 'string').join(', ');

      const adresseDest = [
        destination.adresse,
        destination.quartier,
        destination.commune,
        destination.department,
        destination.region,
      ].filter((v): v is string => typeof v === 'string').join(', ');

      const res = await fetch('/api/livraison/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adresseCollecte,
          adresseDest,
          latCollecte: collecte.lat,
          lngCollecte: collecte.lon,
          latDest: destination.lat,
          lngDest: destination.lon,
          description: description || null,
          prix: prixEstime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création');

      toast.success('Livraison demandée avec succès !');
      router.push('/dashboard/livraison');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/livraison" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Nouvelle livraison</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Point de collecte */}
          <LocationCascade
            label="📍 Point de collecte"
            color="green"
            onLocationChange={handleCollecteChange}
          />

          {/* Point de destination */}
          <LocationCascade
            label="🏁 Point de livraison"
            color="red"
            onLocationChange={handleDestinationChange}
          />

          {/* Description */}
          <div className="bg-white rounded-xl p-4 border">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description du colis (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Ex: Documents, vêtements, électronique..."
            />
          </div>

          {/* Estimation */}
          {prixEstime && distanceEstimee && (
            <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0d2440] rounded-xl p-6 text-white">
              <h3 className="font-bold mb-3">Estimation</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-blue-200">Distance</p>
                  <p className="text-xl font-bold">{distanceEstimee.toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200">Prix estimé</p>
                  <p className="text-xl font-bold text-[#e8a020]">{formatPrice(prixEstime)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200">Durée estimée</p>
                  <p className="text-xl font-bold">~30 min</p>
                </div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <Link
              href="/dashboard/livraison"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading || !prixEstime}
              className="flex-1 bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Création...' : 'Demander la livraison'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
