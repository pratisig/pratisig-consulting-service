'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, MapPin, Navigation, Clock } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import DeliveryLocationSelector from '@/components/shared/DeliveryLocationSelector';
import { calculatePriceByDistance, estimateDeliveryTime, formatPrice, formatDuration, calculateDistance } from '@/lib/utils/delivery';
import { geocodeAddress } from '@/lib/utils/geocoding';
import { getErrorMessage } from '@/lib/utils/error';

const InteractiveMap = dynamic(() => import('@/components/shared/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement de la carte...</p>
    </div>
  ),
});

export default function NouvelleLivraisonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState<'collecte' | 'dest' | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  const [collecte, setCollecte] = useState({
    region: '',
    department: '',
    commune: '',
    quartier: '',
    adresse: '',
    zone: '',
    price: 0,
    lat: 0,
    lng: 0,
  });

  const [destination, setDestination] = useState({
    region: '',
    department: '',
    commune: '',
    quartier: '',
    adresse: '',
    zone: '',
    price: 0,
    lat: 0,
    lng: 0,
  });

  const [description, setDescription] = useState('');
  const [prixEstime, setPrixEstime] = useState<number | null>(null);
  const [distanceEstimee, setDistanceEstimee] = useState<number | null>(null);
  const [dureeEstimee, setDureeEstimee] = useState<number | null>(null);

  async function geocoderAdresse(type: 'collecte' | 'dest') {
    const location = type === 'collecte' ? collecte : destination;
    
    if (!location.adresse || !location.commune) {
      toast.error('Veuillez sélectionner une commune et entrer une adresse');
      return;
    }

    setGeocoding(type);
    try {
      const fullAddress = [
        location.adresse,
        location.quartier,
        location.commune,
        location.department,
        location.region,
        'Sénégal'
      ].filter(Boolean).join(', ');

      const result = await geocodeAddress(fullAddress);
      
      if (result) {
        if (type === 'collecte') {
          setCollecte(prev => ({ ...prev, lat: result.lat, lng: result.lon }));
        } else {
          setDestination(prev => ({ ...prev, lat: result.lat, lng: result.lon }));
        }
        toast.success('Position trouvée !');
      } else {
        toast.error('Adresse non trouvée. Essayez d\'être plus précis.');
      }
    } catch (error) {
      toast.error('Erreur de géocodage');
    } finally {
      setGeocoding(null);
    }
  }

  async function estimerPrix() {
    if (!collecte.lat || !collecte.lng || !destination.lat || !destination.lng) {
      // Pas de coordonnées, utiliser les prix de zone
      const prixTotal = collecte.price + destination.price;
      setPrixEstime(prixTotal);
      toast.info(`Prix estimé : ${formatPrice(prixTotal)} (basé sur les zones)`);
      return;
    }

    // Calculer la distance et le prix
    const distance = calculateDistance(collecte.lat, collecte.lng, destination.lat, destination.lng);
    const prixBase = calculatePriceByDistance(distance);
    const duree = estimateDeliveryTime(distance);

    setDistanceEstimee(distance);
    setPrixEstime(prixBase);
    setDureeEstimee(duree);
    setShowMap(true);
    
    toast.success(`Distance: ${distance.toFixed(1)} km | Durée: ${formatDuration(duree)}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prixEstime) { 
      toast.error('Estimez d\'abord le prix'); 
      return; 
    }

    if (!collecte.adresse || !destination.adresse) {
      toast.error('Veuillez remplir toutes les adresses');
      return;
    }

    setLoading(true);
    try {
      const adresseCollecte = `${collecte.adresse}, ${collecte.quartier || ''} ${collecte.commune}, ${collecte.department}, ${collecte.region}`;
      const adresseDest = `${destination.adresse}, ${destination.quartier || ''} ${destination.commune}, ${destination.department}, ${destination.region}`;

      const res = await fetch('/api/livraison/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adresseCollecte,
          adresseDest,
          latCollecte: collecte.lat || undefined,
          lngCollecte: collecte.lng || undefined,
          latDest: destination.lat || undefined,
          lngDest: destination.lng || undefined,
          description,
          prix: prixEstime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      
      toast.success('Livraison demandée ! Un livreur va accepter.');
      router.push('/dashboard/livraison');
    } catch (err: any) { 
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
          <Link href="/dashboard/livraison" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Nouvelle livraison</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Localisation de collecte */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c] flex items-center gap-2">
              <MapPin size={20} className="text-green-600" /> Point de collecte
            </h2>

            <DeliveryLocationSelector
              label="Où récupérer le colis ?"
              color="green"
              onLocationChange={(loc) => setCollecte(prev => ({ ...prev, ...loc }))}
            />

            <button
              type="button"
              onClick={() => geocoderAdresse('collecte')}
              disabled={geocoding === 'collecte'}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {geocoding === 'collecte' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Navigation size={16} />
              )}
              {geocoding === 'collecte' ? 'Géolocalisation...' : 'Géolocaliser l\'adresse'}
            </button>
          </div>

          {/* Localisation de destination */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c] flex items-center gap-2">
              <MapPin size={20} className="text-red-600" /> Point de livraison
            </h2>

            <DeliveryLocationSelector
              label="Où livrer le colis ?"
              color="red"
              onLocationChange={(loc) => setDestination(prev => ({ ...prev, ...loc }))}
            />

            <button
              type="button"
              onClick={() => geocoderAdresse('dest')}
              disabled={geocoding === 'dest'}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {geocoding === 'dest' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Navigation size={16} />
              )}
              {geocoding === 'dest' ? 'Géolocalisation...' : 'Géolocaliser l\'adresse'}
            </button>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c]">Description du colis</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Ex: Documents, vêtements, électronique..."
            />
          </div>

          {/* Estimation et Carte */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a3a5c] flex items-center gap-2">
              <Clock size={20} /> Estimation
            </h2>

            {prixEstime === null ? (
              <button
                type="button"
                onClick={estimerPrix}
                className="w-full border-2 border-[#1a3a5c] text-[#1a3a5c] py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                📊 Estimer le prix et la distance
              </button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Distance</p>
                    <p className="text-xl font-bold text-green-700">
                      {distanceEstimee ? `${distanceEstimee.toFixed(1)} km` : '-'}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Durée</p>
                    <p className="text-xl font-bold text-blue-700">
                      {dureeEstimee ? formatDuration(dureeEstimee) : '-'}
                    </p>
                  </div>
                  <div className="bg-[#1a3a5c] rounded-xl p-4 text-center">
                    <p className="text-xs text-white mb-1">Prix</p>
                    <p className="text-xl font-bold text-[#e8a020]">
                      {formatPrice(prixEstime)}
                    </p>
                  </div>
                </div>

                {/* Carte avec itinéraire */}
                {showMap && collecte.lat && collecte.lng && destination.lat && destination.lng && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Itinéraire de livraison
                    </p>
                    <InteractiveMap
                      lat={collecte.lat}
                      lon={collecte.lng}
                      zoom={12}
                      title="Point de collecte"
                      address={collecte.adresse}
                      showControls={false}
                      showRoute={true}
                      routeDestination={{
                        lat: destination.lat,
                        lon: destination.lng,
                        name: destination.adresse,
                      }}
                      markers={[
                        {
                          lat: destination.lat,
                          lon: destination.lng,
                          title: 'Point de livraison',
                          description: destination.adresse,
                        },
                      ]}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading || prixEstime === null}
            className="w-full bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {loading ? 'Commande en cours...' : 'Commander la livraison'}
          </button>
        </form>
      </div>
    </div>
  );
}
