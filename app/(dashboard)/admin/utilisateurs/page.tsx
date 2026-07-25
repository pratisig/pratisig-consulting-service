'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Search, Users, ChevronLeft, ChevronRight, Shield, Edit3, Trash2, Ban, Check, Loader2, X, UserPlus } from 'lucide-react';
import { ROLE_LABELS, ROLE_HIERARCHY, canManageRole, PERMISSION_LABELS } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Role, Permission, UserStatus } from '@prisma/client';

interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  image: string | null;
  lastLogin: string | null;
  createdAt: string;
  extraPermissions: string[];
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CLIENT' as Role,
    status: 'ACTIVE' as UserStatus,
  });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [currentUser, page, search, roleFilter, statusFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId: string, role: Role) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setEditUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  }

  async function updateStatus(userId: string, status: UserStatus) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchUsers();
      else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  }

  async function deleteUser(userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    }
  }

  const canManage = (targetRole: string) => {
    if (!currentUser) return false;
    return canManageRole(currentUser.role as Role, targetRole as Role);
  };

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      
      toast.success('Utilisateur créé avec succès !');
      setShowAddUser(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'CLIENT' as Role, status: 'ACTIVE' as UserStatus });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingUser(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Gestion des utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{total} utilisateur{total > 1 ? 's' : ''} au total</p>
        </div>
        {currentUser?.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => setShowAddUser(true)}
            className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors"
          >
            <UserPlus size={16} />
            Ajouter un utilisateur
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        >
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="PENDING">En attente</option>
          <option value="BANNED">Banni</option>
          <option value="SUSPENDED">Suspendu</option>
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#1a3a5c]" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Inscrit le</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#1a3a5c] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.name || 'Sans nom'}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-[#1a3a5c] px-2.5 py-1 rounded-full font-medium">
                        <Shield size={12} />
                        {ROLE_LABELS[u.role as Role] || u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium',
                        u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                        u.status === 'BANNED' ? 'bg-red-50 text-red-700' :
                        u.status === 'SUSPENDED' ? 'bg-orange-50 text-orange-700' :
                        'bg-yellow-50 text-yellow-700'
                      )}>
                        {u.status === 'ACTIVE' ? 'Actif' :
                         u.status === 'BANNED' ? 'Banni' :
                         u.status === 'SUSPENDED' ? 'Suspendu' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canManage(u.role) && (
                          <>
                            <button
                              onClick={() => setEditUser(u)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              title="Modifier le rôle"
                            >
                              <Edit3 size={15} />
                            </button>
                            {u.status === 'ACTIVE' ? (
                              <button
                                onClick={() => updateStatus(u.id, 'BANNED')}
                                className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-600 transition-colors"
                                title="Suspendre"
                              >
                                <Ban size={15} />
                              </button>
                            ) : (
                              <button
                                onClick={() => updateStatus(u.id, 'ACTIVE')}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                title="Réactiver"
                              >
                                <Check size={15} />
                              </button>
                            )}
                            {currentUser?.role === 'SUPER_ADMIN' && u.role !== 'SUPER_ADMIN' && u.id !== currentUser.id && (
                              <button
                                onClick={() => setShowDeleteConfirm(u.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">Page {page} sur {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1a3a5c]">Modifier le rôle</h3>
              <button onClick={() => setEditUser(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Utilisateur : <strong>{editUser.name || editUser.email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-3">Rôle actuel : <strong>{ROLE_LABELS[editUser.role as Role]}</strong></p>
            
            <div className="space-y-2 max-h-64 overflow-auto">
              {ROLE_HIERARCHY.filter(role => canManage(role)).map(role => (
                <button
                  key={role}
                  onClick={() => updateRole(editUser.id, role)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    editUser.role === role
                      ? 'bg-[#1a3a5c] text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  )}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Supprimer cet utilisateur ?</h3>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteUser(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1a3a5c]">Ajouter un utilisateur</h3>
              <button onClick={() => setShowAddUser(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="jean@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="Laisser vide pour utiliser 'password123'"
                />
                <p className="text-xs text-gray-500 mt-1">Par défaut: password123</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                >
                  {ROLE_HIERARCHY.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value as UserStatus })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="PENDING">En attente</option>
                  <option value="SUSPENDED">Suspendu</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 px-4 py-2 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#0d2440] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingUser ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  {creatingUser ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
