'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { getErrorMessage } from '@/lib/utils/error';
import { Save, Loader2, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function FactureConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    nomEntreprise: '',
    adresse: '',
    ville: '',
    pays: '',
    telephone: '',
    email: '',
    siteWeb: '',
    logo: '',
    numeroRegistre: '',
    ninea: '',
    rccm: '',
    conditions: '',
    piedPage: '',
  });

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/facture/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Erreur chargement config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/facture/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Configuration de facture mise à jour !');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a3a5c]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#1a3a5c] rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Configuration des Factures</h1>
          <p className="text-sm text-gray-500">Personnalisez l'en-tête de vos factures</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'entreprise */}
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
            <Building2 size={18} />
            Informations de l'entreprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise *</label>
              <input
                name="nomEntreprise"
                value={config.nomEntreprise}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                name="adresse"
                value={config.adresse}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                name="ville"
                value={config.ville}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                name="pays"
                value={config.pays}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                name="telephone"
                value={config.telephone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={config.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              <input
                name="siteWeb"
                value={config.siteWeb}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
              <input
                name="logo"
                value={config.logo}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Informations légales */}
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="font-bold text-[#1a3a5c] mb-4">Informations légales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Registre</label>
              <input
                name="numeroRegistre"
                value={config.numeroRegistre}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NINEA</label>
              <input
                name="ninea"
                value={config.ninea}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Numéro NINEA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RCCM</label>
              <input
                name="rccm"
                value={config.rccm}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
          </div>
        </div>

        {/* Conditions et pied de page */}
        <div className="bg-white rounded-xl p-6 border">
          <h2 className="font-bold text-[#1a3a5c] mb-4">Conditions et pied de page</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de paiement</label>
              <textarea
                name="conditions"
                value={config.conditions}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Ex: Paiement à la livraison, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pied de page</label>
              <textarea
                name="piedPage"
                value={config.piedPage}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Texte affiché en bas de facture"
              />
            </div>
          </div>
        </div>

        {/* Aperçu et sauvegarde */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#1a3a5c] text-white rounded-xl font-semibold hover:bg-[#0d2440] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
