'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import { Trash2, Edit3, Eye, Loader2, Building2, Package, ShoppingBag, Truck, Wallet, Utensils } from 'lucide-react';
import Link from 'next/link';

interface Record {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status?: string;
  price?: number;
}

export default function AdminGestionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      loadRecords();
    }
  }, [user, filter]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/records');
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est irréversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/delete?type=${type}&id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Enregistrement supprimé avec succès');
        loadRecords();
      } else {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === 'all' || record.type === filter;
    const matchesSearch = search === '' || 
      record.title.toLowerCase().includes(search.toLowerCase()) ||
      record.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'bien': return <Building2 className="w-5 h-5" />;
      case 'produit': return <Package className="w-5 h-5" />;
      case 'commande': return <ShoppingBag className="w-5 h-5" />;
      case 'livraison': return <Truck className="w-5 h-5" />;
      case 'transaction': return <Wallet className="w-5 h-5" />;
      case 'article': return <Utensils className="w-5 h-5" />;
      default: return null;
    }
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case 'bien': return 'Immobilier';
      case 'produit': return 'Produit';
      case 'commande': return 'Commande';
      case 'livraison': return 'Livraison';
      case 'transaction': return 'Transaction';
      case 'article': return 'Article';
      default: return type;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'bien': return 'bg-blue-100 text-blue-700';
      case 'produit': return 'bg-purple-100 text-purple-700';
      case 'commande': return 'bg-green-100 text-green-700';
      case 'livraison': return 'bg-orange-100 text-orange-700';
      case 'transaction': return 'bg-indigo-100 text-indigo-700';
      case 'article': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Accès refusé</h2>
          <p className="text-gray-500">Cette page est réservée au Super Admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Gestion Globale</h1>
            <p className="text-gray-500 text-sm">Administration de tous les enregistrements (Mode Super Admin)</p>
          </div>
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">
            ⚠️ Mode Super Admin - Actions irréversibles
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
            >
              <option value="all">Tous les services</option>
              <option value="bien">Immobilier</option>
              <option value="produit">Produits</option>
              <option value="commande">Commandes</option>
              <option value="livraison">Livraisons</option>
              <option value="transaction">Transactions</option>
              <option value="article">Articles</option>
            </select>
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a3a5c]" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">Aucun enregistrement trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div key={`${record.type}-${record.id}`} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getServiceColor(record.type)}`}>
                        {getServiceIcon(record.type)}
                        {getServiceName(record.type)}
                      </span>
                      {record.status && (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          {record.status}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{record.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                      {record.price && (
                        <span className="font-semibold text-[#e8a020]">
                          {record.price.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(record.type, record.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{records.filter(r => r.type === 'bien').length}</p>
              <p className="text-xs text-gray-500">Biens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{records.filter(r => r.type === 'produit').length}</p>
              <p className="text-xs text-gray-500">Produits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{records.filter(r => r.type === 'commande').length}</p>
              <p className="text-xs text-gray-500">Commandes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{records.filter(r => r.type === 'livraison').length}</p>
              <p className="text-xs text-gray-500">Livraisons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{records.filter(r => r.type === 'transaction').length}</p>
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{records.filter(r => r.type === 'article').length}</p>
              <p className="text-xs text-gray-500">Articles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
