import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/rbac';
import { ArrowLeft, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GestionUtilisateursPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const user = session.user as any;
  if (!hasPermission(user.role, 'admin:users')) redirect('/auth/unauthorized');

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, name: true, email: true, role: true, status: true, phone: true, createdAt: true },
  }).catch(() => []);

  const ROLE_COLORS: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    SUPERVISEUR: 'bg-indigo-100 text-indigo-700',
    AGENT: 'bg-blue-100 text-blue-700',
    GERANT: 'bg-cyan-100 text-cyan-700',
    CAISSIER: 'bg-teal-100 text-teal-700',
    PROPRIETAIRE: 'bg-green-100 text-green-700',
    LIVREUR: 'bg-orange-100 text-orange-700',
    CLIENT: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/admin" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Gestion des utilisateurs</h1>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">{users.length} utilisateur(s)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nom</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Tél</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Rôle</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Statut</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(users as any[]).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-[#1a3a5c]">{u.name ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] ?? 'bg-gray-100'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        u.status === 'BANNED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/api/admin/users/${u.id}/activate`} className="text-green-600 hover:text-green-800" title="Activer">
                          <UserCheck size={16} />
                        </Link>
                        <Link href={`/api/admin/users/${u.id}/ban`} className="text-red-400 hover:text-red-600" title="Bannir">
                          <UserX size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
