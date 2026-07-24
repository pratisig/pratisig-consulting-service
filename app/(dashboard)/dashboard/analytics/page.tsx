'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2, TrendingUp, ShoppingBag, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#1a3a5c', '#e8a020', '#27ae60', '#e74c3c', '#9b59b6', '#f39c12'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    ventes: [],
    commandes: [],
    produits: [],
    revenue: [],
    categories: [],
  });

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Tableaux de Bord Analytiques</h1>
          <p className="text-gray-500 text-sm mt-1">Visualisation des indicateurs clés</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalRevenue?.toLocaleString('fr-FR') || 0} F</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCommandes || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ventes alimentation</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalVentesAlim || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Produits actifs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalProduits || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des ventes */}
          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="font-bold text-[#1a3a5c] mb-4">Évolution du chiffre d'affaires</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1a3a5c" strokeWidth={2} name="CA (FCFA)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Commandes par statut */}
          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="font-bold text-[#1a3a5c] mb-4">Commandes par statut</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.commandesStatut || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.commandesStatut?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Produits par catégorie */}
          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="font-bold text-[#1a3a5c] mb-4">Produits par catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.produitsCategorie || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#e8a020" name="Nombre de produits" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top produits vendus */}
          <div className="bg-white rounded-xl p-6 shadow border">
            <h3 className="font-bold text-[#1a3a5c] mb-4">Top 10 produits vendus</h3>
            <div className="space-y-3">
              {(stats.topProduits || []).map((produit: any, index: number) => (
                <div key={produit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#1a3a5c] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#1a3a5c] text-sm">{produit.nom}</p>
                      <p className="text-xs text-gray-500">{produit.categorie}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#e8a020]">{produit.totalVendu?.toLocaleString('fr-FR')} F</p>
                    <p className="text-xs text-gray-500">{produit.quantiteVendue} vendus</p>
                  </div>
                </div>
              ))}
              {(!stats.topProduits || stats.topProduits.length === 0) && (
                <p className="text-center text-gray-400 py-8">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
