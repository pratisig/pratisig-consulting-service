'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

type Bien = {
  id: string;
  titre: string;
  prixVente?: number | null;
  prixLoyer?: number | null;
  latitude: number | null;
  longitude: number | null;
  type: string;
};

type Props = {
  biens: Bien[];
};

// Centre par défaut : Dakar
const DEFAULT_CENTER: [number, number] = [14.6928, -17.4467];

export default function CarteImmobilier({ biens }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="w-full h-[500px] bg-slate-100 rounded-xl flex items-center justify-center text-xs text-gray-400">
        Chargement de la carte...
      </div>
    );
  }

  const biensAvecCoords = biens.filter((b) => b.latitude != null && b.longitude != null);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <MapContainer center={DEFAULT_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {biensAvecCoords.map((bien) => (
          <Marker key={bien.id} position={[bien.latitude!, bien.longitude!]}>
            <Popup>
              <div style={{ minWidth: 150 }}>
                <strong>{bien.titre}</strong>
                <br />
                <span style={{ color: '#e8a020', fontWeight: 'bold' }}>
                  {bien.prixVente
                    ? `${bien.prixVente.toLocaleString('fr-FR')} FCFA`
                    : `${(bien.prixLoyer ?? 0).toLocaleString('fr-FR')} FCFA/mois`}
                </span>
                <br />
                <span style={{ fontSize: 12, color: '#666' }}>{bien.type}</span>
                <br />
                <Link href={`/immobilier/${bien.id}`} style={{ fontSize: 12, color: '#1a3a5c' }}>
                  Voir la fiche →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
