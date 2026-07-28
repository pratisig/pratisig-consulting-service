'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Shield, Check, X, Loader2, User } from 'lucide-react';

interface Proprietaire {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export default function ProprietairesPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      router.push('/dashboard');
      return;
    }
    fetchProprietaires();
  }, [currentUser]);

  async function fetchProprietaires() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/proprietaires');
      if (res.ok) {
        const data = await res.json();
        setProprietaires(data);
      }
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(userId: string, status: string) {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        fetchProprietaires();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Validation des Propriétaires</h1>
          <p className="text-gray-500 text-sm mt-1">
            {proprietaires.filter(p => p.status === 'PENDING').length} en attente de validation
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#1a3a5c]" />
        </div>
      ) : proprietaires.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Aucun propriétaire inscrit</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Propriétaire</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Inscrit le</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proprietaires.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white font-bold">
                        {p.name?.charAt(0) || p.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.name || 'Sans nom'}</p>
                        <p className="text-xs text-gray-500">Propriétaire</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{p.email}</p>
                    {p.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.status === 'ACTIVE' ? 'Actif' :
                       p.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateStatus(p.id, 'ACTIVE')}
                            disabled={actionLoading === p.id}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                            title="Valider"
                          >
                            {actionLoading === p.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => updateStatus(p.id, 'BANNED')}
                            disabled={actionLoading === p.id}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Rejeter"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {p.status === 'ACTIVE' && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <Check size={14} /> Validé
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
