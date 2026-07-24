'use client';

import { useState, useEffect } from 'react';
import locationsData from '@/lib/data/senegal-locations.json';
import { DELIVERY_ZONES, calculateDeliveryPrice } from '@/lib/utils/delivery';

interface DeliveryLocationSelectorProps {
  label: string;
  color: 'green' | 'red';
  onLocationChange: (location: {
    region: string;
    department: string;
    commune: string;
    quartier?: string;
    adresse: string;
    zone: string;
    price: number;
  }) => void;
  initialValue?: {
    region?: string;
    department?: string;
    commune?: string;
    quartier?: string;
    adresse?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const locations = locationsData as any;

export default function DeliveryLocationSelector({
  label,
  color,
  onLocationChange,
  initialValue,
}: DeliveryLocationSelectorProps) {
  const [region, setRegion] = useState(initialValue?.region || '');
  const [department, setDepartment] = useState(initialValue?.department || '');
  const [commune, setCommune] = useState(initialValue?.commune || '');
  const [quartier, setQuartier] = useState(initialValue?.quartier || '');
  const [adresse, setAdresse] = useState(initialValue?.adresse || '');

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
  
  // Déterminer la zone de livraison
  const getZone = () => {
    if (isDakar && quartier) {
      // Pour Dakar, utiliser le quartier comme zone
      return DELIVERY_ZONES[quartier] ? quartier : 'Dakar';
    }
    if (commune && DELIVERY_ZONES[commune]) {
      return commune;
    }
    if (department && DELIVERY_ZONES[department]) {
      return department;
    }
    if (region && DELIVERY_ZONES[region]) {
      return region;
    }
    return '';
  };

  useEffect(() => {
    const zone = getZone();
    const price = zone ? calculateDeliveryPrice(zone) : 0;
    
    onLocationChange({
      region,
      department,
      commune,
      quartier: isDakar ? quartier : undefined,
      adresse,
      zone,
      price,
    });
  }, [region, department, commune, quartier, adresse]);

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

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      ring: 'focus:ring-green-400',
      text: 'text-green-700',
      icon: 'text-green-600',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      ring: 'focus:ring-red-400',
      text: 'text-red-700',
      icon: 'text-red-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
      <div className="flex items-center gap-2 mb-3">
        <svg className={`w-5 h-5 ${colors.icon}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <span className={`font-semibold ${colors.text} text-sm`}>{label}</span>
      </div>

      <div className="space-y-3">
        {/* Région */}
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm ${colors.ring} focus:outline-none focus:ring-2`}
          required
        >
          <option value="">Sélectionnez une région</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Département */}
        {region && (
          <select
            value={department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${colors.ring} focus:outline-none focus:ring-2`}
            required
          >
            <option value="">Sélectionnez un département</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        {/* Commune */}
        {department && (
          <select
            value={commune}
            onChange={(e) => handleCommuneChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${colors.ring} focus:outline-none focus:ring-2`}
            required
          >
            <option value="">Sélectionnez une commune</option>
            {communes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Quartier (Dakar) ou Ville/Village (autres) */}
        {commune && (
          <>
            {isDakar && quartiers.length > 0 ? (
              <select
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${colors.ring} focus:outline-none focus:ring-2`}
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
                placeholder={isDakar ? 'Quartier' : 'Ville / Village'}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${colors.ring} focus:outline-none focus:ring-2`}
              />
            )}
          </>
        )}

        {/* Adresse détaillée */}
        {commune && (
          <input
            type="text"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Adresse détaillée (rue, n°, repère...)"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${colors.ring} focus:outline-none focus:ring-2`}
            required
          />
        )}
      </div>
    </div>
  );
}
