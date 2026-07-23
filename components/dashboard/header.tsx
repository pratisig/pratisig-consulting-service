'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { Bell, Menu } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/auth/permissions';

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-gray-500">
          Bienvenue, <span className="text-[#1a3a5c] font-semibold">{user?.name || 'Utilisateur'}</span>
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs bg-blue-50 text-[#1a3a5c] px-3 py-1 rounded-full font-medium">
          {user ? ROLE_LABELS[user.role] : ''}
        </span>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
