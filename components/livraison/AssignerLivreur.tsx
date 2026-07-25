'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Loader2, CheckCircle } from 'lucide-react';

interface AssignerLivreurProps {
  livraisonId: string;
  livreurActuelId?: string | null;
}

interface Livreur {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

export default function AssignerLivreur({ livraisonId, livreurActuelId }: AssignerLivreurProps) {
  const [loading, setLoading] = useState(false);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [livreurSelectionne, setLivreurSelectionne] = useState(livreurActuelId || '');
  const router = useRouter();

  useEffect(() => {
    fetchLivreurs();
  }, []);

  async function fetchLivreurs() {
    try {
      const res = await fetch('/api/admin/livreurs');
      if (res.ok) {
        const data = await res.json();
        setLivreurs(data);
      }
    } catch (err) {
      console.error('Erreur chargement livreurs:', err);
    }
  }

  async function handleAssigner() {
    if (!livreurSelectionne) {
      toast.error('Sélectionnez un livreur');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/livraison/${livraisonId}/assigner`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livreurId: livreurSelectionne }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'assignation');

      toast.success('Livreur assigné avec succès !');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
        <User size={18} /> Assigner un livreur
      </h3>
      
      <div className="space-y-3">
        <select
          value={livreurSelectionne}
          onChange={(e) => setLivreurSelectionne(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        >
          <option value="">Sélectionnez un livreur</option>
          {livreurs.map((livreur) => (
            <option key={livreur.id} value={livreur.id}>
              {livreur.name || livreur.email} {livreur.phone ? `(${livreur.phone})` : ''}
            </option>
          ))}
        </select>

        <button
          onClick={handleAssigner}
          disabled={loading || !livreurSelectionne}
          className="w-full bg-[#e8a020] text-white py-3 rounded-xl font-semibold hover:bg-[#d4911d] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {loading ? 'Assignation...' : 'Assigner le livreur'}
        </button>

        {livreurActuelId && (
          <p className="text-xs text-green-600 text-center font-medium">
            ✓ Livreur déjà assigné
          </p>
        )}
      </div>
    </div>
  );
}
