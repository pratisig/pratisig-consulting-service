'use client';

import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CodePromoInputProps {
  montant: number;
  onApply: (reduction: number, totalFinal: number, promoId: string) => void;
  onRemove: () => void;
  promoApplied?: {
    id: string;
    code: string;
    reduction: number;
  } | null;
}

export default function CodePromoInput({ montant, onApply, onRemove, promoApplied }: CodePromoInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!code.trim()) {
      toast.error('Entrez un code promo');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), montantCommande: montant }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        toast.error(data.error || 'Code invalide');
        return;
      }

      onApply(data.reduction, data.totalFinal, data.promo.id);
      toast.success(`Réduction de ${data.reduction.toLocaleString('fr-FR')} FCFA appliquée !`);
    } catch (error) {
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  if (promoApplied) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Code appliqué</p>
              <p className="text-xs text-green-700">{promoApplied.code} (-{promoApplied.reduction.toLocaleString('fr-FR')} F)</p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-red-600 hover:bg-red-50 p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <Tag size={14} />
        Code promo
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Entrez votre code"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        />
        <button
          onClick={handleValidate}
          disabled={loading}
          className="px-4 py-2 bg-[#1a3a5c] text-white rounded-lg text-sm font-medium hover:bg-[#0d2440] disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Appliquer
        </button>
      </div>
    </div>
  );
}
