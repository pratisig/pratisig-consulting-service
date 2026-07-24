'use client';

import { useState, useEffect } from 'react';
import locationsData from '@/lib/data/senegal-locations.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const locations = locationsData as any;

interface LocationSelectorProps {
  onLocationChange: (location: {
    region: string;
    department: string;
    commune: string;
    quartier?: string;
    lat?: number;
    lon?: number;
  }) => void;
  initialValue?: {
    region?: string;
    department?: string;
    commune?: string;
    quartier?: string;
  };
}

export default function LocationSelector({ onLocationChange, initialValue }: LocationSelectorProps) {
  const [region, setRegion] = useState(initialValue?.region || '');
  const [department, setDepartment] = useState(initialValue?.department || '');
  const [commune, setCommune] = useState(initialValue?.commune || '');
  const [quartier, setQuartier] = useState(initialValue?.quartier || '');

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

  const isDakar = region === 'Dakar';

  useEffect(() => {
    if (region) {
      const regionData = locations[region];
      const coords = {
        lat: regionData.lat,
        lon: regionData.lon
      };

      if (department && regionData.departments?.[department]) {
        coords.lat = regionData.departments[department].lat;
        coords.lon = regionData.departments[department].lon;

        if (commune && regionData.departments[department].communes?.[commune]) {
          coords.lat = regionData.departments[department].communes[commune].lat;
          coords.lon = regionData.departments[department].communes[commune].lon;
        }
      }

      onLocationChange({
        region,
        department,
        commune,
        quartier: isDakar ? quartier : undefined,
        ...coords
      });
    }
  }, [region, department, commune, quartier]);

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setDepartment('');
    setCommune('');
    setQuartier('');
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setCommune('');
    setQuartier('');
  };

  const handleCommuneChange = (value: string) => {
    setCommune(value);
    setQuartier('');
  };

  return (
    <div className="space-y-4">
      {/* Région */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Région *
        </label>
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent"
          required
        >
          <option value="">Sélectionnez une région</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Département */}
      {region && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Département *
          </label>
          <select
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent"
            required
          >
            <option value="">Sélectionnez un département</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {/* Commune */}
      {department && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commune *
          </label>
          <select
            value={commune}
            onChange={(e) => handleCommuneChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent"
            required
          >
            <option value="">Sélectionnez une commune</option>
            {communes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Quartier (Dakar uniquement) ou Ville/Village (autres régions) */}
      {commune && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isDakar ? 'Quartier' : 'Ville / Village'}
          </label>
          {isDakar && quartiers.length > 0 ? (
            <select
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent"
            >
              <option value="">Sélectionnez un quartier</option>
              {quartiers.map((q: string) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              placeholder={isDakar ? 'Entrez le nom du quartier' : 'Entrez le nom de la ville ou du village'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent"
            />
          )}
        </div>
      )}
    </div>
  );
}
