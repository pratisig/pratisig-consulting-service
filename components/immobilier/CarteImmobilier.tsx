'use client';
import { useEffect, useRef } from 'react';

interface Bien {
  id: string;
  titre: string;
  prix: number;
  latitude: number;
  longitude: number;
  transactionType: string;
  type: string;
}

export default function CarteImmobilier({ biens }: { biens: Bien[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    // ✅ Injecter le CSS Leaflet via un <link> CDN (évite l'import statique webpack)
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      const map = L.default.map(mapRef.current!, {
        center: [14.6937, -17.4441], // Dakar
        zoom: 12,
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
