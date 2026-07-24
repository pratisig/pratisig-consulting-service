'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

interface Bien {
  id: string;
  titre: string;
  latitude: number;
  longitude: number;
  prixVente?: number | null;
  prixLoyer?: number | null;
  type: string;
  ville: string;
  quartier?: string | null;
}

interface CarteBiensProps {
  biens: Bien[];
}

export default function CarteBiens({ biens }: CarteBiensProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Center map on Dakar by default
    const center: [number, number] = [14.6937, -17.4467];
    const map = L.map(mapRef.current).setView(center, 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for each bien
    biens.forEach(bien => {
      const marker = L.marker([bien.latitude, bien.longitude]).addTo(map);
      
      const price = bien.prixVente 
        ? `${bien.prixVente.toLocaleString('fr-FR')} FCFA`
        : `${(bien.prixLoyer ?? 0).toLocaleString('fr-FR')} FCFA/mois`;
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong style="font-size: 14px; color: #1a3a5c;">${bien.titre}</strong>
          <br/>
          <span style="color: #666; font-size: 12px;">${bien.ville}${bien.quartier ? `, ${bien.quartier}` : ''}</span>
          <br/>
          <span style="color: #e8a020; font-weight: bold; font-size: 14px;">${price}</span>
          <br/>
          <span style="font-size: 11px; color: #888;">${bien.type} · ${bien.prixVente ? 'Vente' : 'Location'}</span>
          <br/>
          <a href="/immobilier/${bien.id}" style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: #1a3a5c; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">Voir le bien →</a>
        </div>
      `);
    });

    // Fit bounds if we have biens
    if (biens.length > 0) {
      const bounds = L.latLngBounds(biens.map(b => [b.latitude, b.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [biens]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px]"
      style={{ zIndex: 0 }}
    />
  );
}
