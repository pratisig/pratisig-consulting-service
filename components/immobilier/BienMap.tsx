'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapPin, Navigation, Route } from 'lucide-react';

const InteractiveMap = dynamic(() => import('@/components/shared/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement de la carte...</p>
    </div>
  ),
});

interface BienMapProps {
  lat: number;
  lon: number;
  title: string;
  address: string;
}

export default function BienMap({ lat, lon, title, address }: BienMapProps) {
  const [showRouteCalc, setShowRouteCalc] = useState(false);
  const [destination, setDestination] = useState({ lat: 14.7684, lon: -17.4467 }); // Centre Dakar par défaut

  return (
    <div className="bg-white rounded-2xl p-5 shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1a3a5c] text-sm flex items-center gap-2">
          <MapPin size={16} /> Localisation
        </h3>
        <button
          onClick={() => setShowRouteCalc(!showRouteCalc)}
          className="text-xs text-[#e8a020] font-medium hover:underline flex items-center gap-1"
        >
          <Route size={12} />
          {showRouteCalc ? 'Masquer' : 'Calculer distance'}
        </button>
      </div>

      <InteractiveMap
        lat={lat}
        lon={lon}
        zoom={15}
        title={title}
        address={address}
        showControls={true}
      />

      {showRouteCalc && (
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Calculer la distance depuis ce bien :
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Latitude destination</label>
              <input
                type="number"
                step="any"
                value={destination.lat}
                onChange={(e) => setDestination(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                className="w-full border rounded-lg px-2 py-1.5 text-xs"
                placeholder="14.7684"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Longitude destination</label>
              <input
                type="number"
                step="any"
                value={destination.lon}
                onChange={(e) => setDestination(prev => ({ ...prev, lon: parseFloat(e.target.value) }))}
                className="w-full border rounded-lg px-2 py-1.5 text-xs"
                placeholder="-17.4467"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.google.com/maps/dir/${lat},${lon}/${destination.lat},${destination.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1a3a5c] text-white rounded-lg text-xs font-medium hover:bg-[#0d2440] transition-colors"
            >
              <Navigation size={12} />
              Itinéraire Google Maps
            </a>
          </div>

          <p className="text-xs text-gray-400 text-center">
            💡 Utilisez Google Maps pour voir l&apos;itinéraire complet et les transports en commun
          </p>
        </div>
      )}
    </div>
  );
}
