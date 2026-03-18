'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  { id: 'WAVE', nom: 'Wave', couleur: '#1B9BF0', emoji: '🌊' },
  { id: 'ORANGE_MONEY', nom: 'Orange Money', couleur: '#FF6600', emoji: '🟠' },
  { id: 'YASH_MONEY', nom: 'Yash Money', couleur: '#8B0000', emoji: '💳' },
  { id: 'KAPEY', nom: 'Kapey', couleur: '#006400', emoji: '💚' },
  { id: 'FREE_MONEY', nom: 'Free Money', couleur: '#CC0000', emoji: '📱' },
  { id: 'EMONEY', nom: 'E-Money', couleur: '#4B0082', emoji: '💜' },
];

const TYPES = [
  { id: 'DEPOT', label: 'Dépôt' },
  { id: 'RETRAIT', label: 'Retrait' },
  { id: 'TRANSFERT', label: 'Transfert' },
  { id: 'PAIEMENT_FACTURE', label: 'Paiement facture' },
  { id: 'RECHARGE', label: 'Recharge' },
];

export default function NouvelleOperationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    service: 'WAVE', type: 'DEPOT', montant: '', clientPhone: '', clientNom: '', notes: '',
  });

  const serviceActif = SERVICES.find(s => s.id === form.service)!;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/transfert/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, montant: parseFloat(form.montant) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      toast.success('Opération enregistrée !');
      router.push('/dashboard/transfert');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/transfert" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Nouvelle opération</h1>
        </div>

        {/* Sélection service */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {SERVICES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, service: s.id }))}
              className={`border-2 rounded-xl p-3 text-center transition-all ${
                form.service === s.id ? 'border-[#1a3a5c] bg-[#1a3a5c] text-white' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-2xl">{s.emoji}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: form.service === s.id ? 'white' : s.couleur }}>{s.nom}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="p-3 rounded-xl text-white text-sm font-semibold text-center" style={{ backgroundColor: serviceActif.couleur }}>
            {serviceActif.emoji} {serviceActif.nom} — Nouvelle opération
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'opération *</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
            <input name="montant" type="number" value={form.montant} onChange={handleChange} required min="1" max="5000000"
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="5000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone client *</label>
            <input name="clientPhone" type="tel" value={form.clientPhone} onChange={handleChange} required
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="+221 77 000 00 00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom client</label>
            <input name="clientNom" type="text" value={form.clientNom} onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" placeholder="Mamadou Diop" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Valider l'opération
          </button>
        </form>
      </div>
    </div>
  );
}
