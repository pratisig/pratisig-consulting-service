'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
};

export default function CarteImmobilier({ lat, lng, zoom = 13 }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-gray-400">
        Chargement de la carte...
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden">
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
