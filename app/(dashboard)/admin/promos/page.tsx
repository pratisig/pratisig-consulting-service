'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getErrorMessage } from '@/lib/utils/error';
import { Plus, Tag, Trash2, Edit3, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Promo {
  id: string;
  code: string;
  type: string;
  valeur: number;
  minCommande: number;
  maxUsage: number;
  usageCount: number;
  isActive: boolean;
  dateDebut: string;
  dateFin: string | null;
}

export default function PromosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    valeur: '',
    minCommande: '',
    maxUsage: '',
    dateFin: '',
  });

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          valeur: parseFloat(form.valeur),
          minCommande: parseFloat(form.minCommande) || 0,
          maxUsage: parseInt(form.maxUsage) || 0,
          dateFin: form.dateFin || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Code promo créé avec succès !');
      setShowForm(false);
      setForm({ code: '', type: 'PERCENTAGE', valeur: '', minCommande: '', maxUsage: '', dateFin: '' });
      fetchPromos();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Codes Promo</h1>
          <p className="text-sm text-gray-500 mt-1">Gérer les codes de réduction</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors"
        >
          {showForm ? <XCircle size={16} /> : <Plus size={16} />}
          {showForm ? 'Annuler' : 'Nouveau code'}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="font-bold text-[#1a3a5c] mb-4">Créer un code promo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="PROMO20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                >
                  <option value="PERCENTAGE">Pourcentage (%)</option>
                  <option value="FIXED">Montant fixe (FCFA)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur *</label>
                <input
                  type="number"
                  value={form.valeur}
                  onChange={(e) => setForm({ ...form, valeur: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. commande</label>
                <input
                  type="number"
                  value={form.minCommande}
                  onChange={(e) => setForm({ ...form, minCommande: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max. utilisations</label>
                <input
                  type="number"
                  value={form.maxUsage}
                  onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="0 (illimité)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
              <input
                type="datetime-local"
                value={form.dateFin}
                onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#0d2440] font-medium"
            >
              Créer le code promo
            </button>
          </form>
        </div>
      )}

      {/* Liste des promos */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Valeur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Utilisations</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Expiration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {promos.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-[#1a3a5c]">{promo.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {promo.type === 'PERCENTAGE' ? '%' : 'FCFA'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#e8a020]">
                    {promo.valeur}{promo.type === 'PERCENTAGE' ? '%' : ' F'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {promo.usageCount}{promo.maxUsage > 0 ? ` / ${promo.maxUsage}` : ' ∞'}
                  </td>
                  <td className="px-4 py-3">
                    {promo.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle size={14} /> Actif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-700">
                        <XCircle size={14} /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {promo.dateFin ? new Date(promo.dateFin).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {promos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Tag size={48} className="mx-auto mb-3 opacity-30" />
            <p>Aucun code promo créé</p>
          </div>
        )}
      </div>
    </div>
  );
}
