'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Users, Building2, ShoppingBag, Truck, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/auth/permissions';
import { cn, formatCurrency } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  roleDistribution: { role: string; count: number }[];
  recentUsers: { id: string; name: string; email: string; role: string; status: string; createdAt: string }[];
  services: { immobilier: number; ecommerce: { produits: number; commandes: number }; livraison: number; transfert: number };
  recentActivity: { id: string; action: string; entity: string; createdAt: string; user: { name: string } }[];
  growth: { thisMonth: number; lastMonth: number; rate: number };
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }
    fetchStats();
  }, [user]);

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#1a3a5c] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!stats) return <div className="text-center text-gray-500 py-12">Impossible de charger les statistiques</div>;

  const statCards = [
    { label: 'Utilisateurs totaux', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', change: stats.growth.rate },
    { label: 'Utilisateurs actifs', value: stats.activeUsers, icon: Activity, color: 'bg-green-500' },
    { label: 'Biens immobiliers', value: stats.services.immobilier, icon: Building2, color: 'bg-purple-500' },
    { label: 'Produits en boutique', value: stats.services.ecommerce.produits, icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Commandes', value: stats.services.ecommerce.commandes, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Livraisons', value: stats.services.livraison, icon: Truck, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Administration</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme</p>
      </div>

      {/* Growth banner */}
      <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0d2440] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Inscriptions ce mois</p>
            <p className="text-3xl font-bold mt-1">{stats.growth.thisMonth}</p>
            <div className="flex items-center gap-1 mt-2">
              {stats.growth.rate >= 0 ? (
                <ArrowUpRight size={16} className="text-green-400" />
              ) : (
                <ArrowDownRight size={16} className="text-red-400" />
              )}
              <span className={cn('text-sm font-medium', stats.growth.rate >= 0 ? 'text-green-400' : 'text-red-400')}>
                {stats.growth.rate >= 0 ? '+' : ''}{stats.growth.rate}%
              </span>
              <span className="text-blue-200 text-sm">vs mois dernier ({stats.growth.lastMonth})</span>
            </div>
          </div>
          <TrendingUp size={48} className="text-[#e8a020] opacity-50" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.color)}>
                <card.icon size={20} className="text-white" />
              </div>
              {card.change !== undefined && (
                <span className={cn('text-xs font-medium px-2 py-1 rounded-full', card.change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[#1a3a5c]">{card.value}</p>
            <p className="text-gray-500 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h3 className="font-bold text-[#1a3a5c] mb-4">Répartition des rôles</h3>
          <div className="space-y-3">
            {stats.roleDistribution.sort((a, b) => b.count - a.count).map((r) => (
              <div key={r.role} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-40 truncate">
                  {ROLE_LABELS[r.role as keyof typeof ROLE_LABELS] || r.role}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-[#1a3a5c] h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.max((r.count / stats.totalUsers) * 100, 2)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-[#1a3a5c] w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1a3a5c]">Inscriptions récentes</h3>
            <a href="/admin/utilisateurs" className="text-sm text-[#e8a020] font-medium hover:underline">Voir tout</a>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.name || 'Sans nom'}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                  u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                )}>
                  {u.status}
                </span>
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Aucune inscription récente</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h3 className="font-bold text-[#1a3a5c] mb-4">Activité récente</h3>
        <div className="space-y-2">
          {stats.recentActivity.map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50">
              <Activity size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600 flex-1">
                <span className="font-medium text-[#1a3a5c]">{log.user?.name || 'Système'}</span>
                {' — '}
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{log.action}</span>
                {log.entity && <span className="text-gray-400 ml-2">({log.entity})</span>}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {stats.recentActivity.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Aucune activité enregistrée</p>
          )}
        </div>
      </div>
    </div>
  );
}
