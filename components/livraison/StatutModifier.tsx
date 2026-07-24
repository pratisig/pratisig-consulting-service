'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';

interface StatutModifierProps {
  livraisonId: string;
  statutActuel: string;
  userRole: string;
}

const STATUTS_POSSIBLES = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'bg-yellow-500' },
  { value: 'ACCEPTEE', label: 'Acceptée', color: 'bg-blue-500' },
  { value: 'EN_ROUTE_COLLECTE', label: 'En route collecte', color: 'bg-indigo-500' },
  { value: 'COLLECTE', label: 'Colis collecté', color: 'bg-purple-500' },
  { value: 'EN_ROUTE_LIVRAISON', label: 'En route livraison', color: 'bg-orange-500' },
  { value: 'LIVREE', label: 'Livrée', color: 'bg-green-500' },
  { value: 'ANNULEE', label: 'Annulée', color: 'bg-red-500' },
];

export default function StatutModifier({ livraisonId, statutActuel, userRole }: StatutModifierProps) {
  const [loading, setLoading] = useState(false);
  const [nouveauStatut, setNouveauStatut] = useState(statutActuel);
  const router = useRouter();

  const handleChangerStatut = async () => {
    if (nouveauStatut === statutActuel) {
      toast.error('Sélectionnez un nouveau statut');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/livraison/${livraisonId}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: nouveauStatut }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour');

      toast.success('Statut mis à jour avec succès !');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Déterminer les statuts disponibles selon le rôle
  const getStatutsDisponibles = () => {
    if (userRole === 'LIVREUR') {
      return STATUTS_POSSIBLES.filter(s => 
        ['ACCEPTEE', 'EN_ROUTE_COLLECTE', 'COLLECTE', 'EN_ROUTE_LIVRAISON', 'LIVREE'].includes(s.value)
      );
    }
    if (['SUPER_ADMIN', 'ADMIN', 'MANAGER_LIVRAISON'].includes(userRole)) {
      return STATUTS_POSSIBLES;
    }
    return [];
  };

  const statutsDisponibles = getStatutsDisponibles();

  if (statutsDisponibles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
        <CheckCircle size={18} /> Modifier le statut
      </h3>
      
      <div className="space-y-3">
        <select
          value={nouveauStatut}
          onChange={(e) => setNouveauStatut(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        >
          {statutsDisponibles.map((statut) => (
            <option key={statut.value} value={statut.value}>
              {statut.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleChangerStatut}
          disabled={loading || nouveauStatut === statutActuel}
          className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {loading ? 'Mise à jour...' : 'Mettre à jour le statut'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Statut actuel : <span className="font-semibold">{statutActuel.replace('_', ' ')}</span>
        </p>
      </div>
    </div>
  );
}
