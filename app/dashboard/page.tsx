import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');

  const user = session.user as any;

  const modules = [
    { id: 'immobilier', label: 'Immobilier', icon: '🏠', href: '/dashboard/immobilier', roles: ['PROPRIETAIRE', 'GERANT', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'transfert', label: 'Transfert', icon: '💸', href: '/dashboard/transfert', roles: ['AGENT', 'SUPERVISEUR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'alimentation', label: 'Alimentation', icon: '🛒', href: '/dashboard/alimentation', roles: ['CAISSIER', 'GERANT', 'SUPERVISEUR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'ecommerce', label: 'E-commerce', icon: '🛍️', href: '/dashboard/ecommerce', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { id: 'livraison', label: 'Livraison', icon: '🚀', href: '/dashboard/livraison', roles: ['LIVREUR', 'CLIENT', 'SUPERVISEUR', 'ADMIN', 'SUPER_ADMIN'] },
    { id: 'admin', label: 'Administration', icon: '⚙️', href: '/dashboard/admin', roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const accessibleModules = modules.filter((m) => m.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Tableau de bord</h1>
          <p className="text-gray-500">Bienvenue, {user.name ?? user.email} — rôle : <span className="font-semibold text-[#e8a020]">{user.role}</span></p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {accessibleModules.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="bg-white border-2 border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-[#1a3a5c] transition-all text-center group"
            >
              <div className="text-4xl mb-3">{m.icon}</div>
              <p className="font-semibold text-[#1a3a5c] group-hover:text-[#e8a020] transition-colors">{m.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
