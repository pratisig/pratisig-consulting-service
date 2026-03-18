import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, DollarSign, ShoppingCart, Store, Truck, Settings, LogOut, LayoutDashboard, Menu } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;

  const navItems = [
    { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard, roles: ['CLIENT','PROPRIETAIRE','LIVREUR','CAISSIER','GERANT','AGENT','SUPERVISEUR','ADMIN','SUPER_ADMIN'] },
    { href: '/dashboard/immobilier', label: 'Immobilier', icon: Home, roles: ['PROPRIETAIRE','GERANT','ADMIN','SUPER_ADMIN'] },
    { href: '/dashboard/transfert', label: 'Transfert', icon: DollarSign, roles: ['AGENT','SUPERVISEUR','ADMIN','SUPER_ADMIN'] },
    { href: '/dashboard/alimentation', label: 'Alimentation', icon: ShoppingCart, roles: ['CAISSIER','GERANT','SUPERVISEUR','ADMIN','SUPER_ADMIN'] },
    { href: '/dashboard/ecommerce', label: 'E-commerce', icon: Store, roles: ['ADMIN','SUPER_ADMIN'] },
    { href: '/dashboard/livraison', label: 'Livraison', icon: Truck, roles: ['LIVREUR','CLIENT','SUPERVISEUR','ADMIN','SUPER_ADMIN'] },
    { href: '/dashboard/admin', label: 'Administration', icon: Settings, roles: ['ADMIN','SUPER_ADMIN'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 bg-[#1a3a5c] flex-col fixed h-full z-20">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e8a020] rounded-full flex items-center justify-center font-bold text-white">
              P
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Pratisig</p>
              <p className="text-blue-200 text-xs">Consulting Service</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:bg-white/10 hover:text-white transition-all text-sm group"
            >
              <item.icon size={18} className="group-hover:text-[#e8a020] transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{user.name ?? user.email}</p>
            <p className="text-blue-200 text-xs">{user.role}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex items-center gap-2 text-blue-200 hover:text-white text-sm px-3 py-2 w-full rounded-xl hover:bg-white/10 transition-all">
              <LogOut size={16} /> Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-[#1a3a5c] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e8a020] rounded-full flex items-center justify-center font-bold text-sm">P</div>
            <span className="font-bold text-sm">Pratisig</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200 bg-white/10 px-2 py-1 rounded-full">{user.role}</span>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="lg:hidden bg-[#0d2440] flex overflow-x-auto gap-1 px-4 py-2 sticky top-12 z-10">
          {visibleItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-all min-w-fit">
              <item.icon size={16} />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </nav>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
