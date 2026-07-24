'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Navigation, MapPin } from 'lucide-react';

const InteractiveMap = dynamic(() => import('@/components/shared/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement de la carte...</p>
    </div>
  ),
});

interface LivraisonMapProps {
  latCollecte: number;
  lngCollecte: number;
  latDest: number;
  lngDest: number;
  adresseCollecte: string;
  adresseDest: string;
  livreurLat?: number | null;
  livreurLng?: number | null;
}

export default function LivraisonMap({
  latCollecte,
  lngCollecte,
  latDest,
  lngDest,
  adresseCollecte,
  adresseDest,
  livreurLat,
  livreurLng,
}: LivraisonMapProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculer le centre entre les deux points
  const centerLat = (latCollecte + latDest) / 2;
  const centerLng = (lngCollecte + lngDest) / 2;

  // Préparer les marqueurs
  const markers = [
    {
      lat: latCollecte,
      lon: lngCollecte,
      title: '📦 Point de collecte',
      description: adresseCollecte,
    },
    {
      lat: latDest,
      lon: lngDest,
      title: '🏠 Point de livraison',
      description: adresseDest,
    },
  ];

  // Ajouter la position du livreur si disponible
  if (livreurLat && livreurLng) {
    markers.push({
      lat: livreurLat,
      lon: livreurLng,
      title: '🚴 Position du livreur',
      description: 'En cours de livraison',
    });
  }

  return (
    <div className="space-y-4">
      {/* Carte */}
      <InteractiveMap
        lat={livreurLat || centerLat}
        lon={livreurLng || centerLng}
        zoom={13}
        showControls={false}
        showRoute={true}
        routeDestination={{
          lat: latDest,
          lon: lngDest,
          name: adresseDest,
        }}
        markers={markers}
      />

      {/* Bouton pour afficher les détails */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-4 py-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#0d2440] transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <MapPin size={16} />
        {showDetails ? 'Masquer' : 'Afficher'} les détails
      </button>

      {/* Détails des points */}
      {showDetails && (
        <div className="space-y-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">
                A
              </div>
              <p className="font-semibold text-green-700 text-sm">Point de collecte</p>
            </div>
            <p className="text-gray-700 text-sm ml-8">{adresseCollecte}</p>
            <p className="text-xs text-gray-400 ml-8 font-mono">
              {latCollecte.toFixed(6)}, {lngCollecte.toFixed(6)}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
                B
              </div>
              <p className="font-semibold text-red-700 text-sm">Point de livraison</p>
            </div>
            <p className="text-gray-700 text-sm ml-8">{adresseDest}</p>
            <p className="text-xs text-gray-400 ml-8 font-mono">
              {latDest.toFixed(6)}, {lngDest.toFixed(6)}
            </p>
          </div>

          {livreurLat && livreurLng && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                  🚴
                </div>
                <p className="font-semibold text-blue-700 text-sm">Position du livreur</p>
              </div>
              <p className="text-xs text-gray-400 ml-8 font-mono">
                {livreurLat.toFixed(6)}, {livreurLng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Bouton Google Maps */}
          <a
            href={`https://www.google.com/maps/dir/${latCollecte},${lngCollecte}/${latDest},${lngDest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Navigation size={16} />
            Ouvrir dans Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
