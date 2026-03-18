import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react';

export default function CommandeConfirmeePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 mb-6">
          Votre commande a bien été enregistrée. Notre équipe vous contactera pour la livraison.
        </p>
        <div className="space-y-3">
          <Link href="/boutique" className="flex items-center justify-center gap-2 w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors">
            <ShoppingBag size={18} /> Continuer les achats
          </Link>
          <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full border border-slate-200 text-gray-500 py-3 rounded-xl text-sm hover:bg-slate-50 transition-colors">
            <Home size={16} /> Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
