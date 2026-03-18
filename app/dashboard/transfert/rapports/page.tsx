import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import { ArrowLeft, TrendingUp, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RapportsTransfertPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;
  if (!hasPermission(user.role, 'transfert:reports')) redirect('/auth/unauthorized');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalTransactions, transactionsAujourdhui, parService] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.count({ where: { createdAt: { gte: today } } }),
    prisma.transaction.groupBy({
      by: ['service'],
      _count: { id: true },
      _sum: { montant: true },
    }),
  ]).catch(() => [0, 0, []]);

  const SERVICES_INFO: Record<string, { couleur: string; emoji: string }> = {
    WAVE: { couleur: '#1B9BF0', emoji: '🌊' },
    ORANGE_MONEY: { couleur: '#FF6600', emoji: '🟠' },
    YASH_MONEY: { couleur: '#8B0000', emoji: '💳' },
    KAPEY: { couleur: '#006400', emoji: '💚' },
    FREE_MONEY: { couleur: '#CC0000', emoji: '📱' },
    EMONEY: { couleur: '#4B0082', emoji: '💜' },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/transfert" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Rapports Transfert</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="text-blue-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total transactions</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{totalTransactions as number}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Aujourd'hui</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{transactionsAujourdhui as number}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-yellow-600" size={22} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Services actifs</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{(parService as any[]).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-[#1a3a5c] mb-4">Volume par service</h2>
          <div className="space-y-3">
            {(parService as any[]).map((s) => {
              const info = SERVICES_INFO[s.service] ?? { couleur: '#888', emoji: '💰' };
              return (
                <div key={s.service} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.emoji}</span>
                    <span className="font-semibold" style={{ color: info.couleur }}>{s.service.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1a3a5c]">{s._count.id} opérations</p>
                    <p className="text-sm text-gray-500">{(s._sum.montant ?? 0).toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
