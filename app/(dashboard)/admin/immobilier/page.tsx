'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getErrorMessage } from '@/lib/utils/error';
import { CheckCircle, XCircle, Clock, Building2, MapPin, Eye, AlertTriangle } from 'lucide-react';

interface Bien {
  id: string;
  titre: string;
  description: string;
  type: string;
  prixLoyer: number | null;
  prixVente: number | null;
  surface: number | null;
  nbChambres: number | null;
  nbSallesDeBain: number | null;
  adresse: string;
  ville: string;
  quartier: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  createdAt: string;
  proprietaire: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    whatsapp: string | null;
  };
}

interface Stats {
  totalPending: number;
  totalPublished: number;
  totalActive: number;
}

export default function ValidationImmobilierPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [biens, setBiens] = useState<Bien[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPending: 0, totalPublished: 0, totalActive: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchBiens();
  }, []);

  async function fetchBiens() {
    try {
      const res = await fetch('/api/admin/immobilier/validate');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBiens(data.pending);
      setStats(data.stats);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(bienId: string, action: 'approve' | 'reject') {
    setActionLoading(bienId);
    try {
      const res = await fetch('/api/admin/immobilier/validate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bienId, action, reason: action === 'reject' ? rejectReason : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setBiens(prev => prev.filter(b => b.id !== bienId));
      setSelectedBien(null);
      setRejectReason('');
      fetchBiens();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Validation des biens immobiliers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Approuvez ou rejetez les nouvelles annonces immobiliers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalPending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Publiés</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalPublished}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total actifs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalActive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des biens en attente */}
      {biens.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Aucun bien en attente</h3>
          <p className="text-gray-500 mt-2">Toutes les annonces ont été validées</p>
        </div>
      ) : (
        <div className="space-y-4">
          {biens.map((bien) => (
            <div key={bien.id} className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[#1a3a5c]">{bien.titre}</h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                      En attente
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {bien.ville}{bien.quartier ? ` - ${bien.quartier}` : ''}
                    </span>
                    <span className="font-medium text-[#e8a020]">
                      {bien.prixVente 
                        ? `${bien.prixVente.toLocaleString('fr-FR')} FCFA (vente)`
                        : `${bien.prixLoyer?.toLocaleString('fr-FR')} FCFA/mois (location)`}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{bien.type}</span>
                    {bien.surface && <span>{bien.surface} m²</span>}
                    {bien.nbChambres && <span>{bien.nbChambres} ch.</span>}
                  </div>

                  {bien.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bien.description}</p>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    <p>
                      <span className="font-medium">Propriétaire:</span> {bien.proprietaire.name || 'Non renseigné'}
                    </p>
                    <p>{bien.proprietaire.email}</p>
                    {bien.proprietaire.phone && <p>Tél: {bien.proprietaire.phone}</p>}
                    {bien.proprietaire.whatsapp && <p>WhatsApp: {bien.proprietaire.whatsapp}</p>}
                    <p className="text-gray-400 mt-1">
                      Soumis le {new Date(bien.createdAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(bien.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedBien(bien)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  <button
                    onClick={() => handleAction(bien.id, 'approve')}
                    disabled={actionLoading === bien.id}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => setSelectedBien(bien)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails/rejet */}
      {selectedBien && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#1a3a5c] mb-4">{selectedBien.titre}</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedBien.description || 'Aucune description'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Caractéristiques</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Type:</span> {selectedBien.type}</p>
                    <p><span className="text-gray-500">Ville:</span> {selectedBien.ville}</p>
                    {selectedBien.quartier && <p><span className="text-gray-500">Quartier:</span> {selectedBien.quartier}</p>}
                    <p><span className="text-gray-500">Adresse:</span> {selectedBien.adresse}</p>
                    {selectedBien.surface && <p><span className="text-gray-500">Surface:</span> {selectedBien.surface} m²</p>}
                    {selectedBien.nbChambres && <p><span className="text-gray-500">Chambres:</span> {selectedBien.nbChambres}</p>}
                    {selectedBien.nbSallesDeBain && <p><span className="text-gray-500">SdB:</span> {selectedBien.nbSallesDeBain}</p>}
                    {selectedBien.prixVente && <p><span className="text-gray-500">Prix vente:</span> {selectedBien.prixVente.toLocaleString('fr-FR')} FCFA</p>}
                    {selectedBien.prixLoyer && <p><span className="text-gray-500">Prix location:</span> {selectedBien.prixLoyer.toLocaleString('fr-FR')} FCFA/mois</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Propriétaire</h3>
                  <div className="text-sm space-y-1">
                    <p>{selectedBien.proprietaire.name || 'Non renseigné'}</p>
                    <p>{selectedBien.proprietaire.email}</p>
                    {selectedBien.proprietaire.phone && <p>Tél: {selectedBien.proprietaire.phone}</p>}
                    {selectedBien.proprietaire.whatsapp && <p>WhatsApp: {selectedBien.proprietaire.whatsapp}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du rejet (optionnel)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    rows={3}
                    placeholder="Ex: Informations incomplètes, photos non conformes, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedBien(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleAction(selectedBien.id, 'approve')}
                  disabled={actionLoading === selectedBien.id}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => handleAction(selectedBien.id, 'reject')}
                  disabled={actionLoading === selectedBien.id}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
