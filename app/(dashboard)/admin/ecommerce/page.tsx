'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getErrorMessage } from '@/lib/utils/error';
import { ShoppingBag, Package, TrendingUp, Edit3, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Produit {
  id: string;
  nom: string;
  prix: number;
  prixPromo: number | null;
  stock: number;
  isActive: boolean;
  categorie: { nom: string } | null;
}

interface Commande {
  id: string;
  total: number;
  statut: string;
  modePaiement: string;
  adresseLivraison: string;
  villeLivraison: string;
  telephoneClient: string;
  createdAt: string;
  client: { name: string | null; email: string };
  lignes: { quantite: number; produit: { nom: string } }[];
}

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  CONFIRMEE: 'bg-blue-100 text-blue-700',
  EN_PREPARATION: 'bg-purple-100 text-purple-700',
  EXPEDIEE: 'bg-orange-100 text-orange-700',
  LIVREE: 'bg-green-100 text-green-700',
  ANNULEE: 'bg-red-100 text-red-700',
};

const STATUTS = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];

export default function AdminEcommercePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatut, setUpdatingStatut] = useState<string | null>(null);
  const [tab, setTab] = useState<'commandes' | 'produits'>('commandes');

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [produitsRes, commandesRes] = await Promise.all([
        fetch('/api/ecommerce/produits'),
        fetch('/api/ecommerce/commandes'),
      ]);
      
      if (produitsRes.ok) setProduits(await produitsRes.json());
      if (commandesRes.ok) setCommandes(await commandesRes.json());
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatut(commandeId: string, statut: string) {
    setUpdatingStatut(commandeId);
    try {
      const res = await fetch(`/api/ecommerce/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      
      setCommandes(prev => prev.map(c => c.id === commandeId ? { ...c, statut } : c));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingStatut(null);
    }
  }

  const totalCA = commandes.filter(c => c.statut === 'LIVREE').reduce((s, c) => s + c.total, 0);
  const enAttente = commandes.filter(c => c.statut === 'EN_ATTENTE').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Administration E-commerce</h1>
        <p className="text-sm text-gray-500 mt-1">Gestion des produits et commandes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Produits</p>
              <p className="text-2xl font-bold text-blue-600">{produits.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Commandes</p>
              <p className="text-2xl font-bold text-orange-600">{commandes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{enAttente}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">CA livré</p>
              <p className="text-lg font-bold text-green-600">{totalCA.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('commandes')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            tab === 'commandes' ? 'border-[#1a3a5c] text-[#1a3a5c]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Commandes ({commandes.length})
        </button>
        <button
          onClick={() => setTab('produits')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            tab === 'produits' ? 'border-[#1a3a5c] text-[#1a3a5c]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Produits ({produits.length})
        </button>
      </div>

      {/* Commandes */}
      {tab === 'commandes' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Articles</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Paiement</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {commandes.map((cmd) => (
                  <tr key={cmd.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{cmd.client?.name || 'Anonyme'}</p>
                      <p className="text-xs text-gray-500">{cmd.telephoneClient}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">
                        {cmd.lignes.map(l => `${l.produit.nom} x${l.quantite}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#e8a020]">{cmd.total.toLocaleString('fr-FR')} F</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{cmd.modePaiement}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[cmd.statut]}`}>
                        {cmd.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={cmd.statut}
                        onChange={(e) => updateStatut(cmd.id, e.target.value)}
                        disabled={updatingStatut === cmd.id}
                        className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                      >
                        {STATUTS.map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {commandes.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
              <p>Aucune commande</p>
            </div>
          )}
        </div>
      )}

      {/* Produits */}
      {tab === 'produits' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Catégorie</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Prix</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {produits.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{p.nom}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{p.categorie?.nom || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#e8a020]">{p.prix.toLocaleString('fr-FR')} F</span>
                      {p.prixPromo && (
                        <span className="ml-1 text-xs text-gray-400 line-through">{p.prixPromo.toLocaleString('fr-FR')} F</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        p.stock > 10 ? 'bg-green-100 text-green-700' : 
                        p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a 
                        href={`/dashboard/ecommerce/${p.id}/edit`}
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors inline-flex"
                        title="Modifier"
                      >
                        <Edit3 size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {produits.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p>Aucun produit</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
