'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { DollarSign, CheckCircle, Clock, XCircle, Loader2, Filter, Download } from 'lucide-react';

interface Commission {
  id: string;
  bienId: string | null;
  bien: {
    titre: string;
    adresse: string;
  } | null;
  transactionType: string;
  montantBase: number;
  tauxCommission: number;
  montantCommission: number;
  statut: string;
  proprietaire: {
    name: string | null;
    email: string;
  };
  dateTransaction: string;
  datePaiement: string | null;
  notes: string | null;
}

export default function CommissionsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      router.push('/dashboard');
      return;
    }
    fetchCommissions();
  }, [currentUser, filterStatut, filterType]);

  async function fetchCommissions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatut) params.set('statut', filterStatut);
      if (filterType) params.set('type', filterType);

      const res = await fetch(`/api/admin/commissions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCommissions(data);
      }
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatut(commissionId: string, statut: string) {
    try {
      const res = await fetch(`/api/admin/commissions/${commissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });

      if (res.ok) {
        fetchCommissions();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  }

  const totalCommissions = commissions.reduce((sum, c) => sum + c.montantCommission, 0);
  const payees = commissions.filter(c => c.statut === 'PAYEE').reduce((sum, c) => sum + c.montantCommission, 0);
  const enAttente = commissions.filter(c => c.statut === 'EN_ATTENTE').reduce((sum, c) => sum + c.montantCommission, 0);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/commissions/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchCommissions();
      } else {
        alert(data.error || 'Erreur lors de la synchronisation');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setSyncing(false);
    }
  }

  const STATUT_COLORS: Record<string, string> = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    PAYEE: 'bg-green-100 text-green-700',
    ANNULEE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Gestion des Commissions</h1>
          <p className="text-gray-500 text-sm mt-1">Suivi des commissions immobilières</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {syncing ? 'Synchronisation...' : 'Sync automatique'}
          </button>
          <a
            href="/api/admin/commissions/export"
            className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors"
          >
            <Download size={16} /> Exporter CSV
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total commissions</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{totalCommissions.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Payées</p>
              <p className="text-2xl font-bold text-green-600">{payees.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="text-yellow-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{enAttente.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtres:</span>
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="PAYEE">Payée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        >
          <option value="">Tous les types</option>
          <option value="VENTE">Vente</option>
          <option value="LOCATION">Location</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#1a3a5c]" />
        </div>
      ) : commissions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Aucune commission enregistrée</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Bien</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Propriétaire</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Montant base</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Taux</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Commission</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{c.bien?.titre || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{c.bien?.adresse || ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{c.proprietaire.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{c.proprietaire.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.transactionType === 'VENTE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {c.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {c.montantBase.toLocaleString('fr-FR')} F
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {c.tauxCommission}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-[#e8a020]">
                    {c.montantCommission.toLocaleString('fr-FR')} F
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[c.statut]}`}>
                      {c.statut === 'EN_ATTENTE' ? 'En attente' :
                       c.statut === 'PAYEE' ? 'Payée' : 'Annulée'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.statut === 'EN_ATTENTE' && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateStatut(c.id, 'PAYEE')}
                          className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"
                          title="Marquer comme payée"
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          onClick={() => updateStatut(c.id, 'ANNULEE')}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                          title="Annuler"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    )}
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
