'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  { id: 'WAVE', nom: 'Wave', couleur: '#1B9BF0', emoji: '', description: 'Transfert Wave Sénégal' },
  { id: 'ORANGE_MONEY', nom: 'Orange Money', couleur: '#FF6600', emoji: '🟠', description: 'Orange Money' },
  { id: 'YASH_MONEY', nom: 'Yash Money', couleur: '#8B0000', emoji: '💳', description: 'Yash Money' },
  { id: 'KAPEY', nom: 'Kapey', couleur: '#006400', emoji: '💚', description: 'Kapey' },
  { id: 'FREE_MONEY', nom: 'Free Money', couleur: '#CC0000', emoji: '📱', description: 'Free Money' },
  { id: 'EMONEY', nom: 'E-Money', couleur: '#4B0082', emoji: '💜', description: 'E-Money' },
];

const TYPES = [
  { id: 'DEPOT', nom: 'Dépôt', description: 'Déposer de l\'argent' },
  { id: 'RETRAIT', nom: 'Retrait', description: 'Retirer de l\'argent' },
  { id: 'TRANSFERT', nom: 'Transfert', description: 'Envoyer de l\'argent' },
  { id: 'PAIEMENT_FACTURE', nom: 'Paiement facture', description: 'Payer une facture' },
  { id: 'RECHARGE', nom: 'Recharge', description: 'Recharger un téléphone' },
];

export default function NouvelleOperationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    service: '',
    type: '',
    montant: '',
    clientPhone: '',
    clientNom: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/transfert/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: form.service,
          type: form.type,
          montant: parseFloat(form.montant),
          clientPhone: form.clientPhone,
          clientNom: form.clientNom || null,
          notes: form.notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création');

      toast.success('Transaction créée avec succès !');
      router.push('/dashboard/transfert');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const serviceSelectionne = SERVICES.find(s => s.id === form.service);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/transfert" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Nouvelle opération</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du service */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4">1. Service de transfert</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES.map(service => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setForm({ ...form, service: service.id })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    form.service === service.id
                      ? 'border-[#1a3a5c] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    backgroundColor: form.service === service.id ? `${service.couleur}10` : undefined,
                  }}
                >
                  <div className="text-3xl mb-2">{service.emoji}</div>
                  <p className="font-semibold text-sm text-[#1a3a5c]">{service.nom}</p>
                  <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Type d'opération */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-[#1a3a5c] mb-4">2. Type d'opération</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: type.id })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    form.type === type.id
                      ? 'border-[#1a3a5c] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm text-[#1a3a5c]">{type.nom}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Détails */}
          <div className="bg-white rounded-2xl shadow p-6 space-y-4">
            <h2 className="font-bold text-[#1a3a5c] mb-4">3. Détails de la transaction</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input
                name="montant"
                type="number"
                value={form.montant}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="50000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone client *</label>
                <input
                  name="clientPhone"
                  type="tel"
                  value={form.clientPhone}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="+221 77 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom client</label>
                <input
                  name="clientNom"
                  type="text"
                  value={form.clientNom}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                  placeholder="Nom complet"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>

          {/* Résumé et soumission */}
          {form.service && form.type && form.montant && (
            <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0d2440] rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-3">Résumé de l'opération</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-200">Service</span>
                  <span className="font-semibold">{serviceSelectionne?.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Type</span>
                  <span className="font-semibold">{TYPES.find(t => t.id === form.type)?.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Montant</span>
                  <span className="font-bold text-[#e8a020] text-lg">{parseFloat(form.montant).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/dashboard/transfert"
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading || !form.service || !form.type}
              className="flex-1 bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Création...' : 'Créer la transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
