import Link from 'next/link';
import { MapPin, Package, Clock, Star } from 'lucide-react';

export default function LivraisonPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#1a3a5c] text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">Pratisig <span className="text-[#e8a020]">Livraison</span></Link>
          <Link href="/auth/login" className="text-sm bg-[#e8a020] px-4 py-2 rounded-lg">
            Commander
          </Link>
        </div>
      </header>

      {/* HERO Livraison */}
      <section className="bg-gradient-to-r from-[#1a3a5c] to-[#0d2440] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">🚀 Livraison Express Dakar</h1>
          <p className="text-blue-100 text-lg mb-8">Envoyez ou recevez vos colis. Rapide, sécurisé, traçable.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-[#e8a020] px-8 py-3 rounded-xl font-semibold hover:bg-[#d4911d] transition-colors"
            >
              Demander une livraison
            </Link>
            <Link
              href="/auth/register?role=livreur"
              className="border border-white/30 px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Devenir livreur
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center text-[#1a3a5c] mb-10">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-[#e8a020]" size={28} />
            </div>
            <h3 className="font-bold text-[#1a3a5c] mb-2">1. Définissez les points</h3>
            <p className="text-gray-500 text-sm">Indiquez l&apos;adresse de collecte et de livraison sur la carte.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-[#e8a020]" size={28} />
            </div>
            <h3 className="font-bold text-[#1a3a5c] mb-2">2. Un livreur accepte</h3>
            <p className="text-gray-500 text-sm">Un livreur proche accepte votre demande et récupère le colis.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-[#e8a020]" size={28} />
            </div>
            <h3 className="font-bold text-[#1a3a5c] mb-2">3. Suivi en temps réel</h3>
            <p className="text-gray-500 text-sm">Suivez votre livreur sur la carte jusqu&apos;à la livraison.</p>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-white py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '⚡', label: 'Express', desc: 'Livraison le jour même' },
            { icon: '📍', label: 'Traçable', desc: 'Position GPS live' },
            { icon: '💰', label: 'Accessible', desc: 'Prix selon la zone' },
            { icon: '⭐', label: 'Noté', desc: 'Évaluez votre livreur' },
          ].map((a) => (
            <div key={a.label} className="p-4">
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="font-bold text-[#1a3a5c]">{a.label}</p>
              <p className="text-gray-400 text-xs">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
