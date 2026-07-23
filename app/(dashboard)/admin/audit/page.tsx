'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Activity, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

export default function AuditPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      router.push('/dashboard');
      return;
    }
    fetchLogs();
  }, [currentUser, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setLoading(false);
    }
  }

  const actionColors: Record<string, string> = {
    USER_CREATE: 'bg-green-50 text-green-700',
    USER_UPDATE: 'bg-blue-50 text-blue-700',
    USER_DELETE: 'bg-red-50 text-red-700',
    USER_ROLE_CHANGE: 'bg-purple-50 text-purple-700',
    USER_BAN: 'bg-red-50 text-red-700',
    USER_ACTIVATE: 'bg-green-50 text-green-700',
    BIEN_CREATE: 'bg-emerald-50 text-emerald-700',
    BIEN_UPDATE: 'bg-blue-50 text-blue-700',
    BIEN_DELETE: 'bg-red-50 text-red-700',
    PRODUIT_CREATE: 'bg-emerald-50 text-emerald-700',
    COMMANDE_CREATE: 'bg-orange-50 text-orange-700',
    LIVRAISON_CREATE: 'bg-teal-50 text-teal-700',
    TRANSACTION_CREATE: 'bg-yellow-50 text-yellow-700',
    PERMISSION_CHANGE: 'bg-indigo-50 text-indigo-700',
    CAISSE_OPEN: 'bg-cyan-50 text-cyan-700',
    CAISSE_CLOSE: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Journal d&apos;audit</h1>
          <p className="text-gray-500 text-sm mt-1">Historique de toutes les actions sur la plateforme</p>
        </div>
        <button
          onClick={() => {
            const csv = ['ID,Utilisateur,Action,Entité,Date'].concat(
              logs.map(l => `${l.id},${l.user?.email || 'N/A'},${l.action},${l.entity || ''},${l.createdAt}`)
            ).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#0d2440] transition-colors"
        >
          <Download size={16} />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
        <Filter size={16} className="text-gray-400" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="flex-1 text-sm border-0 focus:outline-none focus:ring-0 p-0"
        >
          <option value="">Toutes les actions</option>
          <option value="USER_CREATE">Création utilisateur</option>
          <option value="USER_UPDATE">Modification utilisateur</option>
          <option value="USER_DELETE">Suppression utilisateur</option>
          <option value="USER_ROLE_CHANGE">Changement de rôle</option>
          <option value="USER_BAN">Bannissement</option>
          <option value="BIEN_CREATE">Création bien</option>
          <option value="BIEN_DELETE">Suppression bien</option>
          <option value="PRODUIT_CREATE">Création produit</option>
          <option value="COMMANDE_CREATE">Création commande</option>
          <option value="LIVRAISON_CREATE">Création livraison</option>
          <option value="TRANSACTION_CREATE">Création transaction</option>
          <option value="PERMISSION_CHANGE">Changement de permission</option>
          <option value="CAISSE_OPEN">Ouverture caisse</option>
          <option value="CAISSE_CLOSE">Fermeture caisse</option>
        </select>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#1a3a5c] border-t-transparent rounded-full"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Activity size={48} className="mx-auto mb-3 opacity-30" />
            <p>Aucun log d&apos;audit</p>
          </div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Activity size={14} className="text-gray-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#1a3a5c]">
                        {log.user?.name || log.user?.email || 'Système'}
                      </span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', actionColors[log.action] || 'bg-gray-100 text-gray-600')}>
                        {log.action}
                      </span>
                      {log.entity && (
                        <span className="text-xs text-gray-400">
                          {log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}
                        </span>
                      )}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
