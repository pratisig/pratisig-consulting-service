'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import locationsData from '@/lib/data/senegal-locations.json';

const InteractiveMap = dynamic(() => import('@/components/shared/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-slate-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Chargement de la carte...</p>
    </div>
  ),
});

interface LocationCascadeProps {
  onLocationChange: (location: {
    region: string;
    department: string;
    commune: string;
    quartier?: string;
    adresse?: string;
    lat: number;
    lon: number;
  }) => void;
  label: string;
  color: 'green' | 'blue' | 'red';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const locations = locationsData as any;

export default function LocationCascade({ onLocationChange, label, color }: LocationCascadeProps) {
  const [region, setRegion] = useState('');
  const [department, setDepartment] = useState('');
  const [commune, setCommune] = useState('');
  const [quartier, setQuartier] = useState('');
  const [adresse, setAdresse] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 14.6937, lon: -17.4467 });
  const [mapReady, setMapReady] = useState(false);

  const regions = Object.keys(locations);
  const departments = region && locations[region] 
    ? Object.keys(locations[region].departments || {})
    : [];
  const communes = region && department && locations[region]?.departments?.[department]
    ? Object.keys(locations[region].departments[department].communes || {})
    : [];
  const quartiers = region && department && commune && locations[region]?.departments?.[department]?.communes?.[commune]
    ? (locations[region].departments[department].communes[commune].quartiers || [])
    : [];

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setDepartment('');
    setCommune('');
    setQuartier('');
    updateCoordinates(value, '', '', '', 14.6937, -17.4467);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setCommune('');
    setQuartier('');
    const dept = locations[region]?.departments?.[value];
    if (dept) {
      updateCoordinates(region, value, '', '', dept.lat, dept.lon);
    }
  };

  const handleCommuneChange = (value: string) => {
    setCommune(value);
    setQuartier('');
    const communeData = locations[region]?.departments?.[department]?.communes?.[value];
    if (communeData) {
      updateCoordinates(region, department, value, '', communeData.lat, communeData.lon);
    }
  };

  const handleQuartierChange = (value: string) => {
    setQuartier(value);
    // Les quartiers n'ont pas de coordonnées spécifiques, on garde celles de la commune
  };

  const handleMapClick = (lat: number, lon: number) => {
    setCoordinates({ lat, lon });
    setMapReady(true);
    updateCoordinates(region, department, commune, quartier, lat, lon);
  };

  const updateCoordinates = (reg: string, dept: string, com: string, quart: string, lat: number, lon: number) => {
    setCoordinates({ lat, lon });
    onLocationChange({
      region: reg,
      department: dept,
      commune: com,
      quartier: quart || undefined,
      adresse: adresse || undefined,
      lat,
      lon,
    });
  };

  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    red: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${colorClasses[color]}`}>
      <h3 className="font-semibold text-sm mb-3">{label}</h3>
      
      <div className="space-y-3">
        {/* Région */}
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
          required
        >
          <option value="">Sélectionnez une région</option>
          {regions.map((r: string) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Département */}
        {region && (
          <select
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            required
          >
            <option value="">Sélectionnez un département</option>
            {departments.map((d: string) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {/* Commune */}
        {department && (
          <select
            value={commune}
            onChange={(e) => handleCommuneChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            required
          >
            <option value="">Sélectionnez une commune</option>
            {communes.map((c: string) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Quartier (Dakar uniquement) */}
        {commune && region === 'Dakar' && quartiers.length > 0 && (
          <select
            value={quartier}
            onChange={(e) => handleQuartierChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
          >
            <option value="">Sélectionnez un quartier</option>
            {quartiers.map((q: string) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        )}

        {/* Adresse détaillée */}
        {commune && (
          <input
            type="text"
            value={adresse}
            onChange={(e) => {
              setAdresse(e.target.value);
              updateCoordinates(region, department, commune, quartier, coordinates.lat, coordinates.lon);
            }}
            placeholder="Adresse détaillée (rue, n°, repère...)"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
          />
        )}

        {/* Carte interactive */}
        {commune && (
          <div>
            <p className="text-xs text-gray-600 mb-2">
              📍 Cliquez sur la carte pour positionner précisément
            </p>
            <InteractiveMap
              lat={coordinates.lat}
              lon={coordinates.lon}
              zoom={15}
              onLocationSelect={handleMapClick}
              showControls={true}
            />
            {mapReady && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded p-2">
                  <p className="text-gray-500">Latitude</p>
                  <p className="font-mono font-semibold">{coordinates.lat.toFixed(6)}</p>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <p className="text-gray-500">Longitude</p>
                  <p className="font-mono font-semibold">{coordinates.lon.toFixed(6)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
