'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';

interface Avis {
  id: string;
  note: number;
  commentaire: string;
  clientName: string;
  createdAt: string;
}

interface AvisComponentProps {
  produitId: string;
  noteMoyenne?: number;
  nbAvis?: number;
}

export default function AvisClient({ produitId, noteMoyenne = 0, nbAvis = 0 }: AvisComponentProps) {
  const { user } = useAuth();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvis();
  }, [produitId]);

  const fetchAvis = async () => {
    try {
      const res = await fetch(`/api/avis?produitId=${produitId}`);
      if (res.ok) {
        const data = await res.json();
        setAvis(data);
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Connectez-vous pour donner un avis');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produitId, note, commentaire }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Avis ajouté avec succès !');
      setShowForm(false);
      setNote(5);
      setCommentaire('');
      fetchAvis();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (note: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={i < note ? 'fill-[#e8a020] text-[#e8a020]' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-4">
      {/* Résumé des avis */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#1a3a5c]">{noteMoyenne.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1">
              {renderStars(Math.round(noteMoyenne))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{nbAvis} avis</p>
          </div>
          <div className="flex-1">
            {user && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full px-4 py-2 bg-[#1a3a5c] text-white rounded-lg text-sm font-medium hover:bg-[#0d2440] transition-colors"
              >
                {showForm ? 'Annuler' : 'Donner mon avis'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNote(n)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={24}
                    className={n <= note ? 'fill-[#e8a020] text-[#e8a020]' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Partagez votre expérience..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-[#e8a020] text-white rounded-lg font-medium hover:bg-[#d4911d] disabled:opacity-50"
          >
            {submitting ? 'Envoi...' : 'Publier l\'avis'}
          </button>
        </form>
      )}

      {/* Liste des avis */}
      {avis.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-[#1a3a5c] flex items-center gap-2">
            <MessageSquare size={16} />
            Avis des clients ({avis.length})
          </h3>
          {avis.map((a) => (
            <div key={a.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {a.clientName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{a.clientName || 'Anonyme'}</p>
                    <div className="flex gap-0.5">
                      {renderStars(a.note, 12)}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {a.commentaire && (
                <p className="text-sm text-gray-600 mt-2">{a.commentaire}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
