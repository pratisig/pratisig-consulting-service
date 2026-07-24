'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  lat: number;
  lon: number;
  zoom?: number;
  title?: string;
  address?: string;
  showControls?: boolean;
  onLocationSelect?: (lat: number, lon: number) => void;
  markers?: Array<{
    lat: number;
    lon: number;
    title: string;
    description?: string;
  }>;
  showRoute?: boolean;
  routeDestination?: { lat: number; lon: number; name: string };
}

export default function InteractiveMap({
  lat,
  lon,
  zoom = 13,
  title,
  address,
  showControls = true,
  onLocationSelect,
  markers = [],
  showRoute = false,
  routeDestination
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialiser la carte
    const map = L.map(mapRef.current).setView([lat, lon], zoom);
    mapInstanceRef.current = map;

    // Ajouter les tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marqueur principal
    if (lat && lon) {
      const mainMarker = L.marker([lat, lon]).addTo(map);
      if (title || address) {
        mainMarker.bindPopup(`
          <div style="min-width: 200px;">
            ${title ? `<strong style="font-size: 14px;">${title}</strong><br/>` : ''}
            ${address ? `<span style="color: #666; font-size: 12px;">${address}</span>` : ''}
          </div>
        `);
      }
    }

    // Ajouter les marqueurs supplémentaires
    markers.forEach(marker => {
      const m = L.marker([marker.lat, marker.lon]).addTo(map);
      m.bindPopup(`
        <div style="min-width: 150px;">
          <strong>${marker.title}</strong>
          ${marker.description ? `<br/><span style="color: #666; font-size: 12px;">${marker.description}</span>` : ''}
        </div>
      `);
    });

    // Clic sur la carte pour sélectionner une position
    if (onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLon } = e.latlng;
        onLocationSelect(clickLat, clickLon);
        
        // Ajouter un marqueur temporaire
        L.marker([clickLat, clickLon]).addTo(map)
          .bindPopup('Position sélectionnée')
          .openPopup();
      });
    }

    // Calculer la distance si une destination est fournie
    if (showRoute && routeDestination && lat && lon) {
      calculateRoute(lat, lon, routeDestination.lat, routeDestination.lon);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lon, zoom]);

  // Calculer l'itinéraire avec OSRM
  const calculateRoute = async (startLat: number, startLon: number, endLat: number, endLon: number) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(2); // km
        const duration = (route.duration / 60).toFixed(0); // minutes
        
        setRouteInfo({ distance: `${distance} km`, duration: `${duration} min` });
        
        // Dessiner l'itinéraire sur la carte
        if (mapInstanceRef.current) {
          const routeCoords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          L.polyline(routeCoords, { color: '#1a3a5c', weight: 4 }).addTo(mapInstanceRef.current);
          
          // Ajuster la vue pour voir tout l'itinéraire
          mapInstanceRef.current.fitBounds(L.polyline(routeCoords).getBounds());
        }
      }
    } catch (error) {
      console.error('Erreur de calcul d\'itinéraire:', error);
    }
  };

  // Calculer la distance à vol d'oiseau
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(url, '_blank');
  };

  const openDirectionsInGoogleMaps = () => {
    if (routeDestination) {
      const url = `https://www.google.com/maps/dir/${lat},${lon}/${routeDestination.lat},${routeDestination.lon}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Carte */}
      <div ref={mapRef} className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200" />

      {/* Informations et contrôles */}
      <div className="flex flex-wrap gap-3">
        {/* Coordonnées */}
        <div className="flex-1 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Coordonnées</p>
          <p className="text-sm font-mono text-[#1a3a5c]">
            {lat.toFixed(6)}, {lon.toFixed(6)}
          </p>
        </div>

        {/* Info itinéraire */}
        {routeInfo && (
          <div className="flex-1 bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 mb-1">Itinéraire</p>
            <p className="text-sm font-semibold text-[#1a3a5c]">
              {routeInfo.distance} • {routeInfo.duration}
            </p>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      {showControls && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openInGoogleMaps}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#0d2440] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Voir sur Google Maps
          </button>

          {routeDestination && (
            <button
              onClick={openDirectionsInGoogleMaps}
              className="flex items-center gap-2 px-4 py-2 bg-[#e8a020] text-white rounded-lg hover:bg-[#d4911d] transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.71 11.29l-9-9c-.36-.36-.86-.58-1.41-.58s-1.05.21-1.41.58l-9 9c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L8 7.41V20c0 .55.45 1 1 1s1-.45 1-1V7.41l5.29 5.29c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41z"/>
              </svg>
              Calculer l'itinéraire
            </button>
          )}

          {onLocationSelect && (
            <div className="w-full mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 Cliquez sur la carte pour sélectionner une position précise
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
