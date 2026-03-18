import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/auth/rbac';

const SERVICES_TRANSFERT = [
  { id: 'WAVE', nom: 'Wave', couleur: '#1B9BF0', emoji: '🌊', description: 'Transfert Wave Sénégal' },
  { id: 'ORANGE_MONEY', nom: 'Orange Money', couleur: '#FF6600', emoji: '🟠', description: 'Orange Money' },
  { id: 'YASH_MONEY', nom: 'Yash Money', couleur: '#8B0000', emoji: '💳', description: 'Yash Money' },
  { id: 'KAPEY', nom: 'Kapey', couleur: '#006400', emoji: '💚', description: 'Kapey' },
  { id: 'FREE_MONEY', nom: 'Free Money', couleur: '#CC0000', emoji: '📲', description: 'Free Money' },
  { id: 'EMONEY', nom: 'E-Money', couleur: '#4B0082', emoji: '💜', description: 'E-Money' },
];

export default async function TransfertPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const role = (session.user as any).role;
  if (!hasPermission(role, 'transfert:operate')) redirect('/auth/unauthorized');

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">Transfert d&apos;Argent</h1>
        <p className="text-gray-500 mb-8">Sélectionnez le service de transfert</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICES_TRANSFERT.map((s) => (
            <div
              key={s.id}
              className="bg-white border-2 border-slate-100 rounded-2xl p-6 hover:shadow-lg cursor-pointer transition-all hover:border-[#1a3a5c] text-center"
            >
              <div className="text-5xl mb-3">{s.emoji}</div>
              <p className="font-bold text-lg" style={{ color: s.couleur }}>{s.nom}</p>
              <p className="text-gray-400 text-xs mt-1">{s.description}</p>
              <button
                className="mt-4 w-full py-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: s.couleur }}
              >
                Nouvelle opération
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
