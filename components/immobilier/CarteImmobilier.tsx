'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// On charge react-leaflet seulement côté client
const MapContainer = dynamic(
  async () => (await import('react-leaflet')).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(
  async () => (await import('react-leaflet')).TileLayer,
  { ssr: false }
);
const Marker = dynamic(
  async () => (await import('react-leaflet')).Marker,
  { ssr: false }
);

import 'leaflet/dist/leaflet.css';

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
};

export default function CarteImmobilier({ lat, lng, zoom = 13 }: Props) {
  const [ready, setReady] = useState(false);

  // On ne rend la carte que côté client, après le mount
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
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  );
}
      });
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      biens.forEach((bien) => {
        const marker = L.default.marker([bien.latitude, bien.longitude]);
        marker.bindPopup(`
          <div style="min-width:180px">
            <strong>${bien.titre}</strong><br/>
            <span style="color:#e8a020;font-weight:bold">${bien.prix.toLocaleString('fr-FR')} FCFA</span>
            ${bien.transactionType === 'LOCATION' ? '/mois' : ''}<br/>
            <span style="font-size:11px;color:#666">${bien.transactionType} · ${bien.type}</span><br/>
            <a href="/immobilier/${bien.id}" style="color:#1a3a5c;font-weight:600;font-size:12px">Voir la fiche →</a>
          </div>
        `);
        marker.addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [biens]);

  return <div ref={mapRef} style={{ height: '450px', width: '100%', borderRadius: '16px', overflow: 'hidden' }} />;
}
            <span style="color:#e8a020;font-weight:bold">${bien.prix.toLocaleString('fr-FR')} FCFA</span>
            ${bien.transactionType === 'LOCATION' ? '/mois' : ''}<br/>
            <span style="font-size:11px;color:#666">${bien.transactionType} · ${bien.type}</span><br/>
            <a href="/immobilier/${bien.id}" style="color:#1a3a5c;font-weight:600;font-size:12px">Voir la fiche →</a>
          </div>
        `);
        marker.addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [biens]);

  return <div ref={mapRef} style={{ height: '450px', width: '100%', borderRadius: '16px', overflow: 'hidden' }} />;
}
