'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard, Users, Shield, Activity, Building2, ShoppingBag,
  Truck, Wallet, UtensilsCrossed, Settings, LogOut, ChevronDown, FileCheck, User, Trash2, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/auth/permissions';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER', 'MANAGER_ECOMMERCE', 'MANAGER_LIVRAISON', 'MANAGER_TRANSFERT', 'MANAGER_ALIMENTATION', 'AGENT', 'CAISSIER', 'LIVREUR', 'PROPRIETAIRE', 'CLIENT'] },
  { href: '/admin', label: 'Administration', icon: Shield, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/gestion', label: 'Gestion Globale', icon: Trash2, roles: ['SUPER_ADMIN'] },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/immobilier', label: 'Validation biens', icon: FileCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/ecommerce', label: 'E-commerce Admin', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'] },
  { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/audit', label: 'Journal d\'audit', icon: Activity, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/dashboard/immobilier', label: 'Immobilier', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER', 'PROPRIETAIRE', 'CLIENT'] },
  { href: '/dashboard/profil', label: 'Mon profil', icon: User, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_IMMOBILIER', 'MANAGER_ECOMMERCE', 'MANAGER_LIVRAISON', 'MANAGER_TRANSFERT', 'MANAGER_ALIMENTATION', 'AGENT', 'CAISSIER', 'LIVREUR', 'PROPRIETAIRE', 'CLIENT'] },
  { href: '/dashboard/ecommerce', label: 'E-commerce', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE', 'CLIENT'] },
  { href: '/dashboard/livraison', label: 'Livraison', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_LIVRAISON', 'LIVREUR', 'CLIENT'] },
  { href: '/dashboard/transfert', label: 'Transfert', icon: Wallet, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_TRANSFERT', 'AGENT'] },
  { href: '/dashboard/alimentation', label: 'Alimentation', icon: UtensilsCrossed, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER_ALIMENTATION', 'CAISSIER'] },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filteredNav = navItems.filter(item =>
    item.roles.includes(user?.role || 'CLIENT')
  );

  return (
    <aside className="w-64 bg-[#1a3a5c] text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e8a020] rounded-xl flex items-center justify-center font-bold text-white">
            P
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none">Pratisig</h1>
            <p className="text-blue-200 text-xs mt-0.5">Consulting Service</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto p-3 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/10 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="w-8 h-8 bg-[#e8a020] rounded-full flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-blue-200 truncate">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
          <ChevronDown size={14} className={cn('transition-transform', showUserMenu && 'rotate-180')} />
        </button>

        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl shadow-lg text-gray-700 overflow-hidden">
            <div className="p-3 border-b">
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
