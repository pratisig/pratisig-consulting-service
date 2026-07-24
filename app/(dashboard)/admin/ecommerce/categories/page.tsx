'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/error';
import { Plus, Edit3, Trash2, Loader2, FolderTree } from 'lucide-react';

interface Categorie {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent: { nom: string } | null;
  _count: { produits: number };
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    parentId: '',
  });

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/ecommerce/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategorie 
        ? `/api/ecommerce/categories/${editingCategorie.id}`
        : '/api/ecommerce/categories';
      
      const method = editingCategorie ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          slug: form.nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: form.description || null,
          parentId: form.parentId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingCategorie ? 'Catégorie modifiée' : 'Catégorie créée');
      setShowModal(false);
      setEditingCategorie(null);
      setForm({ nom: '', description: '', parentId: '' });
      fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleEdit = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    setForm({
      nom: categorie.nom,
      description: categorie.description || '',
      parentId: categorie.parentId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;

    try {
      const res = await fetch(`/api/ecommerce/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Catégorie supprimée');
      fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openModal = () => {
    setEditingCategorie(null);
    setForm({ nom: '', description: '', parentId: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  const categoriesPrincipales = categories.filter(c => !c.parentId);
  const getSousCategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Gestion des catégories</h1>
          <p className="text-sm text-gray-500 mt-1">Organisez vos produits en catégories et sous-catégories</p>
        </div>
        <button
          onClick={openModal}
          className="bg-[#1a3a5c] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0d2440] transition-colors"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      {categoriesPrincipales.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border text-center">
          <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune catégorie créée</p>
          <button
            onClick={openModal}
            className="mt-4 bg-[#1a3a5c] text-white px-6 py-2 rounded-xl"
          >
            Créer la première catégorie
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categoriesPrincipales.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FolderTree className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cat.nom}</h3>
                    {cat.description && (
                      <p className="text-xs text-gray-500">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {cat._count.produits} produit{cat._count.produits > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Sous-catégories */}
              {getSousCategories(cat.id).length > 0 && (
                <div className="p-4 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 mb-2">Sous-catégories</p>
                  <div className="space-y-2">
                    {getSousCategories(cat.id).map(sousCat => (
                      <div key={sousCat.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sousCat.nom}</p>
                          {sousCat.description && (
                            <p className="text-xs text-gray-500">{sousCat.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {sousCat._count.produits} produit{sousCat._count.produits > 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => handleEdit(sousCat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(sousCat.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#1a3a5c] mb-4">
                {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie parente
                  </label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  >
                    <option value="">Aucune (catégorie principale)</option>
                    {categories
                      .filter(c => !c.parentId && c.id !== editingCategorie?.id)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategorie(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#0d2440]"
                  >
                    {editingCategorie ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
