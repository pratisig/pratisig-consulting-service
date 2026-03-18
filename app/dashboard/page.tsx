import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, ShoppingCart, Store, Truck, Home, Settings, ArrowRight, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

const MODULES = [
  {
    href: '/dashboard/transfert',
    label: 'Transfert d\'Argent',
    description: 'Wave, Orange Money, Yash Money, Kapey...',
    icon: DollarSign,
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    roles: ['AGENT','SUPERVISEUR','ADMIN','SUPER_ADMIN'],
  },
  {
    href: '/dashboard/alimentation',
    label: 'Alimentation Générale',
    description: 'Caisse, stock, gestion articles',
    icon: ShoppingCart,
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-50',
    roles: ['CAISSIER','GERANT','SUPERVISEUR','ADMIN','SUPER_ADMIN'],
  },
  {
    href: '/dashboard/ecommerce',
    label: 'E-Commerce',
    description: 'Boutique, produits, commandes clients',
    icon: Store,
    color: 'from-purple-500 to-purple-700',
    bg: 'bg-purple-50',
    roles: ['ADMIN','SUPER_ADMIN'],
  },
  {
    href: '/dashboard/livraison',
    label: 'Livraison',
    description: 'Demandes, livreurs, suivi GPS',
    icon: Truck,
    color: 'from-green-500 to-green-700',
    bg: 'bg-green-50',
    roles: ['LIVREUR','CLIENT','SUPERVISEUR','ADMIN','SUPER_ADMIN'],
  },
  {
    href: '/dashboard/immobilier',
    label: 'Immobilier',
    description: 'Biens, annonces, visites',
    icon: Home,
    color: 'from-red-500 to-red-700',
    bg: 'bg-red-50',
    roles: ['PROPRIETAIRE','GERANT','ADMIN','SUPER_ADMIN'],
  },
  {
    href: '/dashboard/admin',
    label: 'Administration',
    description: 'Utilisateurs, rôles, audit logs',
    icon: Settings,
    color: 'from-slate-600 to-slate-800',
    bg: 'bg-slate-50',
    roles: ['ADMIN','SUPER_ADMIN'],
  },
];

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;

  const visibleModules = MODULES.filter(m => m.roles.includes(user.role));
  const heure = new Date().getHours();
  const salutation = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1a3a5c] to-[#0d2440] rounded-2xl flex items-center justify-center">
              <TrendingUp size={22} className="text-[#e8a020]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a5c]">
                {salutation}, {user.name?.split(' ')[0] ?? 'Utilisateur'} 👋
              </h1>
              <p className="text-gray-500 text-sm">Bienvenue sur Pratisig Consulting Service</p>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-gray-600">Rôle actif : </span>
            <span className="font-bold text-[#1a3a5c]">{user.role}</span>
          </div>
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className={`group ${mod.bg} border border-white rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow`}>
                  <mod.icon size={20} className="text-white" />
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-[#1a3a5c] group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="font-bold text-[#1a3a5c] text-base mb-1">{mod.label}</h2>
              <p className="text-gray-500 text-sm">{mod.description}</p>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-xs">
          <p>Pratisig Consulting Service © {new Date().getFullYear()} — Dakar, Sénégal</p>
        </div>
      </div>
    </div>
  );
}
