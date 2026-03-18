import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <ShieldAlert size={64} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès refusé</h1>
      <p className="text-gray-500 mb-6 text-center">
        Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <Link href="/dashboard" className="bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#0d2440] transition-colors">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
