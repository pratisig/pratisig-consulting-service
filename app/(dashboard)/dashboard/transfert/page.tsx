import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, TrendingUp } from 'lucide-react';


const SERVICES_TRANSFERT = [
  { id: 'WAVE', nom: 'Wave', couleur: '#1B9BF0', emoji: '🌊', description: 'Transfert Wave Sénégal' },
  { id: 'ORANGE_MONEY', nom: 'Orange Money', couleur: '#FF6600', emoji: '🟠', description: 'Orange Money' },
  { id: 'YASH_MONEY', nom: 'Yash Money', couleur: '#8B0000', emoji: '💳', description: 'Yash Money' },
  { id: 'KAPEY', nom: 'Kapey', couleur: '#006400', emoji: '💚', description: 'Kapey' },
  { id: 'FREE_MONEY', nom: 'Free Money', couleur: '#CC0000', emoji: '📲', description: 'Free Money' },
  { id: 'EMONEY', nom: 'E-Money', couleur: '#4B0082', emoji: '💜', description: 'E-Money' },
];

export default async function TransfertPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const role = user.role;
  if (!['SUPER_ADMIN','ADMIN','MANAGER_TRANSFERT','AGENT'].includes(user.role)) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">Transfert d&apos;Argent</h1>
            <p className="text-gray-500">Sélectionnez le service de transfert</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/transfert/nouvelle" className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors">
              <Plus size={16} /> Nouvelle opération
            </Link>
            {['SUPER_ADMIN','ADMIN','MANAGER_TRANSFERT'].includes(user.role) && (
              <Link href="/dashboard/transfert/rapports" className="border border-[#1a3a5c] text-[#1a3a5c] px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-colors">
                <TrendingUp size={16} /> Rapports
              </Link>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICES_TRANSFERT.map((s) => (
            <Link
              key={s.id}
              href="/dashboard/transfert/nouvelle"
              className="bg-white border-2 border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-[#1a3a5c] text-center group"
            >
              <div className="text-5xl mb-3">{s.emoji}</div>
              <p className="font-bold text-lg" style={{ color: s.couleur }}>{s.nom}</p>
              <p className="text-gray-400 text-xs mt-1">{s.description}</p>
              <div
                className="mt-4 w-full py-2 rounded-xl text-white text-sm font-semibold transition-opacity group-hover:opacity-90"
                style={{ backgroundColor: s.couleur }}
              >
                Nouvelle opération
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
