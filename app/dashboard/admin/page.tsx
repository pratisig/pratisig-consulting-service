import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import Link from 'next/link';
import { Users, Activity, Shield, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;
  if (!hasPermission(user.role, 'admin:access')) redirect('/auth/unauthorized');

  const [totalUsers, usersByRole, recentAuditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 15, include: { user: { select: { name: true, email: true } } } }),
  ]).catch(() => [0, [], []]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Administration</h1>
          <p className="text-gray-500 text-sm">Gestion globale de la plateforme</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users className="text-blue-600" size={18} /></div>
              <div>
                <p className="text-gray-500 text-xs">Utilisateurs</p>
                <p className="text-2xl font-bold text-[#1a3a5c]">{totalUsers as number}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Activity className="text-green-600" size={18} /></div>
              <div>
                <p className="text-gray-500 text-xs">Logs audit</p>
                <p className="text-2xl font-bold text-[#1a3a5c]">{(recentAuditLogs as any[]).length}+</p>
              </div>
            </div>
          </div>
          <Link href="/dashboard/admin/utilisateurs" className="bg-white rounded-2xl p-5 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Shield className="text-purple-600" size={18} /></div>
              <div>
                <p className="text-gray-500 text-xs">Gérer users</p>
                <p className="text-sm font-bold text-[#1a3a5c]">Rôles &amp; accès →</p>
              </div>
            </div>
          </Link>
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><Database className="text-orange-600" size={18} /></div>
              <div>
                <p className="text-gray-500 text-xs">Rôles actifs</p>
                <p className="text-2xl font-bold text-[#1a3a5c]">{(usersByRole as any[]).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition par rôle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2"><Users size={18} /> Utilisateurs par rôle</h2>
            <div className="space-y-2">
              {(usersByRole as any[]).map((r) => (
                <div key={r.role} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="font-medium text-[#1a3a5c]">{r.role}</span>
                  <span className="bg-[#1a3a5c] text-white px-3 py-1 rounded-full text-sm font-semibold">{r._count.id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit log */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2"><Activity size={18} /> Journal d'audit récent</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(recentAuditLogs as any[]).map((log) => (
                <div key={log.id} className="p-2 border-l-2 border-[#e8a020] pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1a3a5c]">{log.action}</span>
                    <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleTimeString('fr-FR')}</span>
                  </div>
                  <p className="text-xs text-gray-500">{log.user?.name ?? log.user?.email ?? 'Anonyme'} · {log.entity ?? ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
