'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PublicationActionsProps {
  bienId: string;
  isPublished: boolean;
}

export default function PublicationActions({ bienId, isPublished }: PublicationActionsProps) {
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(isPublished);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/immobilier/biens/${bienId}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !published }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      setPublished(!published);
      toast.success(
        !published 
          ? 'Bien publié avec succès !' 
          : 'Bien dépublié (maintenant en attente)'
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-bold text-[#1a3a5c] mb-3 text-sm">Publication</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {published ? (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <CheckCircle size={12} /> Publié
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
              <Clock size={12} /> En attente de validation
            </span>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            published
              ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : published ? (
            <XCircle size={14} />
          ) : (
            <CheckCircle size={14} />
          )}
          {published ? 'Dépublier (mettre en attente)' : 'Publier le bien'}
        </button>

        <p className="text-xs text-gray-500">
          {published
            ? 'Le bien est visible sur la page publique /immobilier'
            : 'Le bien sera visible après publication'}
        </p>
      </div>
    </div>
  );
}
