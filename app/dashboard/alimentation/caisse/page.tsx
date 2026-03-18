'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Minus, Trash2, Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: string; nom: string; prix: number; stock: number; unite: string;
  categorie?: { nom: string };
}
interface LignePanier {
  article: Article; quantite: number;
}

export default function CaissePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [panier, setPanier] = useState<LignePanier[]>([]);
  const [modePaiement, setModePaiement] = useState('ESPECES');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/alimentation/articles').then(r => r.json()).then(setArticles).catch(() => {});
  }, []);

  function ajouterAuPanier(art: Article) {
    setPanier(prev => {
      const existe = prev.find(l => l.article.id === art.id);
      if (existe) return prev.map(l => l.article.id === art.id ? { ...l, quantite: l.quantite + 1 } : l);
      return [...prev, { article: art, quantite: 1 }];
    });
  }

  function modifierQte(id: string, delta: number) {
    setPanier(prev => prev.map(l => l.article.id === id
      ? { ...l, quantite: Math.max(1, l.quantite + delta) } : l
    ).filter(l => l.quantite > 0));
  }

  function supprimerLigne(id: string) {
    setPanier(prev => prev.filter(l => l.article.id !== id));
  }

  const total = panier.reduce((s, l) => s + l.article.prix * l.quantite, 0);

  async function validerVente() {
    if (panier.length === 0) { toast.error('Panier vide'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/alimentation/ventes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modePaiement,
          lignes: panier.map(l => ({ articleId: l.article.id, quantite: l.quantite, prixUnit: l.article.prix })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      toast.success(`Vente validée ! Total : ${total.toLocaleString('fr-FR')} FCFA`);
      setPanier([]);
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  }

  const articlesFiltres = articles.filter(a =>
    a.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard/alimentation" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-[#1a3a5c]">Caisse</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Articles */}
          <div className="bg-white rounded-2xl shadow p-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              placeholder="Rechercher un article..." />
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {articlesFiltres.map(art => (
                <button key={art.id} onClick={() => ajouterAuPanier(art)}
                  className="border-2 border-slate-100 rounded-xl p-3 text-left hover:border-[#1a3a5c] hover:shadow transition-all">
                  <p className="font-semibold text-[#1a3a5c] text-sm">{art.nom}</p>
                  <p className="text-[#e8a020] font-bold text-sm">{art.prix.toLocaleString('fr-FR')} F</p>
                  <p className="text-xs text-gray-400">Stock: {art.stock}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Panier */}
          <div className="bg-white rounded-2xl shadow p-4 flex flex-col">
            <h2 className="font-bold text-[#1a3a5c] mb-4">Panier ({panier.length})</h2>
            <div className="flex-1 space-y-2 mb-4">
              {panier.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Panier vide</p>
              ) : panier.map(l => (
                <div key={l.article.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <p className="font-medium text-sm text-[#1a3a5c]">{l.article.nom}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => modifierQte(l.article.id, -1)} className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><Minus size={12} /></button>
                    <span className="font-bold w-6 text-center text-sm">{l.quantite}</span>
                    <button onClick={() => modifierQte(l.article.id, 1)} className="w-6 h-6 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center"><Plus size={12} /></button>
                    <span className="font-bold text-[#e8a020] text-sm w-20 text-right">{(l.article.prix * l.quantite).toLocaleString('fr-FR')} F</span>
                    <button onClick={() => supprimerLigne(l.article.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg text-[#1a3a5c]">TOTAL</span>
                <span className="font-bold text-2xl text-[#e8a020]">{total.toLocaleString('fr-FR')} F</span>
              </div>
              <select value={modePaiement} onChange={e => setModePaiement(e.target.value)}
                className="w-full border rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
                <option value="ESPECES">Espèces</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
              </select>
              <button onClick={validerVente} disabled={loading || panier.length === 0}
                className="w-full bg-[#27ae60] text-white py-3 rounded-xl font-semibold hover:bg-[#219a52] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <CheckCircle size={18} /> Valider la vente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
