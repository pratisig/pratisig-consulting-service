import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, ShoppingBag, Truck, Wallet, UtensilsCrossed, Shield, Users, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Quick stats for the user
  const [totalBiens, totalProduits, totalCommandes, totalLivraisons, totalTransactions] = await Promise.all([
    prisma.bienImmobilier.count({ where: { isActive: true } }),
    prisma.produit.count({ where: { isActive: true } }),
    prisma.commande.count(),
    prisma.livraison.count(),
    prisma.transaction.count(),
  ]);

  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role);

  const services = [
    { href: '/dashboard/immobilier', label: 'Immobilier', icon: Building2, count: totalBiens, color: 'from-blue-500 to-blue-600', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER', 'PROPRIETAIRE', 'CLIENT'] },
    { href: '/dashboard/ecommerce', label: 'E-commerce', icon: ShoppingBag, count: totalProduits, color: 'from-orange-500 to-orange-600', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE', 'CLIENT'] },
    { href: '/dashboard/livraison', label: 'Livraison', icon: Truck, count: totalLivraisons, color: 'from-red-500 to-red-600', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_LIVRAISON', 'LIVREUR', 'CLIENT'] },
    { href: '/dashboard/transfert', label: 'Transfert', icon: Wallet, count: totalTransactions, color: 'from-green-500 to-green-600', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_TRANSFERT', 'AGENT'] },
    { href: '/dashboard/alimentation', label: 'Alimentation', icon: UtensilsCrossed, count: null, color: 'from-purple-500 to-purple-600', roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_ALIMENTATION', 'CAISSIER'] },
  ];

  const visibleServices = services.filter(s => s.roles.includes(user.role));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a5c]">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue sur votre espace Pratisig</p>
      </div>

      {/* Admin quick access */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin" className="bg-gradient-to-br from-[#1a3a5c] to-[#0d2440] rounded-2xl p-5 text-white hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Shield size={24} className="text-[#e8a020]" />
              <ArrowRight size={16} className="text-blue-200 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="font-bold">Administration</p>
            <p className="text-blue-200 text-xs mt-1">Gérer les utilisateurs et les rôles</p>
          </Link>
          <Link href="/admin/utilisateurs" className="bg-gradient-to-br from-[#e8a020] to-[#d4911d] rounded-2xl p-5 text-white hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Users size={24} className="text-white" />
              <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="font-bold">Utilisateurs</p>
            <p className="text-white/80 text-xs mt-1">Voir et gérer tous les comptes</p>
          </Link>
          <Link href="/admin/audit" className="bg-gradient-to-br from-[#27ae60] to-[#1e8c4c] rounded-2xl p-5 text-white hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Shield size={24} className="text-white" />
              <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="font-bold">Journal d'audit</p>
            <p className="text-white/80 text-xs mt-1">Historique des actions</p>
          </Link>
        </div>
      )}

      {/* Services */}
      <div>
        <h2 className="text-lg font-bold text-[#1a3a5c] mb-4">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleServices.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                  <service.icon size={24} className="text-white" />
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-[#1a3a5c] group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-[#1a3a5c]">{service.label}</h3>
              {service.count !== null && (
                <p className="text-sm text-gray-500 mt-1">{service.count} élément{service.count > 1 ? 's' : ''}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
