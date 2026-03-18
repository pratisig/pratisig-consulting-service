import Link from 'next/link';
import { MapPin, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  const services = [
    {
      id: 'immobilier',
      titre: 'Gestion Immobilière',
      description: 'Achetez, louez ou mettez en gérance vos biens immobiliers à Dakar et au Sénégal.',
      icon: '🏠',
      href: '/immobilier',
      couleur: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'transfert',
      titre: 'Transfert d\'Argent',
      description: 'Wave, Orange Money, Yash Money, Kapey – tous vos transferts au même endroit.',
      icon: '💸',
      href: '/auth/login',
      couleur: 'bg-orange-50 border-orange-200',
    },
    {
      id: 'alimentation',
      titre: 'Alimentation Générale',
      description: 'Gestion de caisse et de stock pour votre commerce de proximité.',
      icon: '🛒',
      href: '/auth/login',
      couleur: 'bg-green-50 border-green-200',
    },
    {
      id: 'ecommerce',
      titre: 'Boutique En Ligne',
      description: 'Découvrez notre boutique et commandez en toute sécurité avec Wave ou Orange Money.',
      icon: '🛍️',
      href: '/boutique',
      couleur: 'bg-purple-50 border-purple-200',
    },
    {
      id: 'livraison',
      titre: 'Service de Livraison',
      description: 'Livraison rapide à Dakar. Suivez votre livreur en temps réel.',
      icon: '🚀',
      href: '/livraison',
      couleur: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-[#1a3a5c] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#e8a020] rounded-full flex items-center justify-center font-bold text-white text-lg">
              P
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Pratisig</h1>
              <p className="text-xs text-blue-200">Consulting Service</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/immobilier" className="hover:text-[#e8a020] transition-colors">Immobilier</Link>
            <Link href="/boutique" className="hover:text-[#e8a020] transition-colors">Boutique</Link>
            <Link href="/livraison" className="hover:text-[#e8a020] transition-colors">Livraison</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-[#e8a020] px-4 py-2 rounded-lg hover:bg-[#d4911d] transition-colors font-medium"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#1a3a5c] to-[#0d2440] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="text-[#e8a020]" size={20} />
            <span className="text-blue-200 text-sm">Dakar, Sénégal</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Votre plateforme
            <span className="text-[#e8a020]"> multiservice</span>
            <br />au Sénégal
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Immobilier, transfert d&apos;argent, alimentation, e-commerce et livraison — tout en un, sécurisé et simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-[#e8a020] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#d4911d] transition-colors flex items-center gap-2 justify-center"
            >
              Commencer gratuitement <ArrowRight size={18} />
            </Link>
            <Link
              href="/immobilier"
              className="border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Voir l&apos;immobilier
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center text-[#1a3a5c] mb-2">Nos Services</h3>
        <p className="text-gray-500 text-center mb-10">Une solution complète pour votre quotidien</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.id}
              href={s.href}
              className={`border-2 ${s.couleur} rounded-2xl p-6 hover:shadow-lg transition-all group`}
            >
              <div className="text-4xl mb-4">{s.icon}</div>
              <h4 className="font-bold text-lg text-[#1a3a5c] mb-2 group-hover:text-[#e8a020] transition-colors">
                {s.titre}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CONFIANCE */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <Shield className="text-[#1a3a5c]" size={36} />
            <h5 className="font-bold text-[#1a3a5c]">Sécurisé</h5>
            <p className="text-gray-500 text-sm">Données chiffrées, accès sécurisé par rôles</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Zap className="text-[#e8a020]" size={36} />
            <h5 className="font-bold text-[#1a3a5c]">Rapide</h5>
            <p className="text-gray-500 text-sm">Application optimisée, accessible partout</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Globe className="text-[#27ae60]" size={36} />
            <h5 className="font-bold text-[#1a3a5c]">Local</h5>
            <p className="text-gray-500 text-sm">Pensé pour le Sénégal, ses modes de paiement</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a3a5c] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold">Pratisig Consulting Service</p>
            <p className="text-blue-200 text-sm">Dakar, Sénégal</p>
          </div>
          <div className="text-blue-200 text-sm">
            © {new Date().getFullYear()} Pratisig. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  );
}
