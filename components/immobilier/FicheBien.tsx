'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Home, BedDouble, Bath, Ruler, ArrowLeft, Phone, Mail, MessageCircle, Eye, Tag, Maximize2, User } from 'lucide-react';
import BienMap from '@/components/immobilier/BienMap';
import ContactForm from '@/components/immobilier/ContactForm';

interface FicheBienProps {
  bien: {
    id: string;
    titre: string;
    description: string | null;
    type: string;
    statut: string;
    prixLoyer: number | null;
    prixVente: number | null;
    surface: number | null;
    nbChambres: number | null;
    nbSallesDeBain: number | null;
    adresse: string;
    ville: string;
    quartier: string | null;
    latitude: number | null;
    longitude: number | null;
    images: string[];
    proprietaire: {
      name: string | null;
      phone: string | null;
      email: string | null;
      whatsapp: string | null;
    };
  };
}

export default function FicheBien({ bien }: FicheBienProps) {
  const [showContact, setShowContact] = useState(false);

  const fullAddress = [bien.adresse, bien.quartier, bien.ville].filter(Boolean).join(', ');
  const prix = bien.prixVente
    ? `${bien.prixVente.toLocaleString('fr-FR')} FCFA`
    : `${(bien.prixLoyer ?? 0).toLocaleString('fr-FR')} FCFA/mois`;

  const whatsappNumber = bien.proprietaire?.whatsapp?.replace(/[\s+\-()]/g, '') || 
                          bien.proprietaire?.phone?.replace(/[\s+\-()]/g, '') || '';

  const whatsappMessage = encodeURIComponent(
    `Bonjour ${bien.proprietaire?.name || ''},\n\nJe suis intéressé(e) par votre bien "${bien.titre}" à ${bien.ville}${bien.quartier ? ` (${bien.quartier})` : ''} au prix de ${prix}.\n\nPourriez-vous me donner plus d'informations ?\n\nMerci.`
  );

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <header className="bg-[#1a3a5c] text-white px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/immobilier" className="hover:text-[#e8a020] transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <span className="font-bold">Fiche du bien</span>
            </div>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{bien.type}</span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Image */}
            <div className="rounded-2xl overflow-hidden h-80 bg-slate-200 relative">
              {bien.images?.[0] ? (
                <img src={bien.images[0]} alt={bien.titre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <Home size={64} className="text-slate-400" />
                </div>
              )}
              <span className="absolute top-3 right-3 bg-[#e8a020] text-white text-xs px-3 py-1.5 rounded-full font-semibold">
                {bien.prixVente ? '🏷️ À vendre' : '🔑 À louer'}
              </span>
            </div>

            {/* Galerie */}
            {bien.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {bien.images.slice(1, 5).map((p: string, i: number) => (
                  <div key={i} className="h-20 rounded-xl overflow-hidden bg-slate-200">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Détails */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">{bien.titre}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <MapPin size={14} /> {fullAddress}
              </div>

              {/* Caractéristiques */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {bien.surface && (
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Maximize2 size={16} className="mx-auto text-[#1a3a5c] mb-1" />
                    <p className="text-sm font-bold text-[#1a3a5c]">{bien.surface} m²</p>
                    <p className="text-xs text-gray-500">Surface</p>
                  </div>
                )}
                {bien.nbChambres && (
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <BedDouble size={16} className="mx-auto text-[#1a3a5c] mb-1" />
                    <p className="text-sm font-bold text-[#1a3a5c]">{bien.nbChambres}</p>
                    <p className="text-xs text-gray-500">Chambre{bien.nbChambres > 1 ? 's' : ''}</p>
                  </div>
                )}
                {bien.nbSallesDeBain && (
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Bath size={16} className="mx-auto text-[#1a3a5c] mb-1" />
                    <p className="text-sm font-bold text-[#1a3a5c]">{bien.nbSallesDeBain}</p>
                    <p className="text-xs text-gray-500">SdB</p>
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <Tag size={16} className="mx-auto text-[#1a3a5c] mb-1" />
                  <p className="text-sm font-bold text-[#1a3a5c]">{bien.type}</p>
                  <p className="text-xs text-gray-500">Type</p>
                </div>
              </div>

              <h2 className="font-semibold text-[#1a3a5c] mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{bien.description || 'Aucune description fournie.'}</p>
            </div>

            {/* Carte */}
            {bien.latitude && bien.longitude && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-[#1a3a5c] mb-3 flex items-center gap-2">
                  <MapPin size={16} /> Localisation
                </h2>
                <BienMap lat={bien.latitude} lon={bien.longitude} title={bien.titre} address={fullAddress} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Prix */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-3xl font-bold text-[#e8a020] mb-1">{prix}</p>
              <p className="text-xs text-gray-500 mb-3">{bien.prixVente ? 'Prix de vente' : 'Loyer mensuel'}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                bien.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                bien.statut === 'RESERVE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>{bien.statut}</span>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
                <User size={16} /> Contacter le propriétaire
              </h3>

              <div className="space-y-3 mb-5">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">Propriétaire :</span>
                  <br />
                  <span className="text-gray-600">{bien.proprietaire?.name ?? 'Non renseigné'}</span>
                </p>
              </div>

              {/* Boutons de contact */}
              <div className="space-y-2">
                {/* Bouton principal - Contacter */}
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full bg-[#e8a020] text-white py-3 rounded-xl font-semibold hover:bg-[#d4911d] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Contacter / Faire une offre
                </button>

                {/* WhatsApp direct */}
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white py-2.5 rounded-xl font-medium hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle size={14} /> WhatsApp direct
                  </a>
                )}

                {/* Téléphone direct */}
                {bien.proprietaire?.phone && (
                  <a
                    href={`tel:${bien.proprietaire.phone}`}
                    className="w-full bg-[#1a3a5c] text-white py-2.5 rounded-xl font-medium hover:bg-[#0d2440] transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Phone size={14} /> Appeler
                  </a>
                )}

                {/* Email */}
                {bien.proprietaire?.email && (
                  <a
                    href={`mailto:${bien.proprietaire.email}?subject=${encodeURIComponent('Intérêt pour: ' + bien.titre)}`}
                    className="w-full bg-gray-100 text-[#1a3a5c] py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm border"
                  >
                    <Mail size={14} /> Email
                  </a>
                )}
              </div>
            </div>

            {/* Caractéristiques rapides */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1a3a5c] mb-3">Caractéristiques</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-800">{bien.type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Statut</span>
                  <span className="font-medium text-gray-800">{bien.statut}</span>
                </div>
                {bien.surface && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500">Surface</span>
                    <span className="font-medium text-gray-800">{bien.surface} m²</span>
                  </div>
                )}
                {bien.nbChambres && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500">Chambres</span>
                    <span className="font-medium text-gray-800">{bien.nbChambres}</span>
                  </div>
                )}
                {bien.nbSallesDeBain && (
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500">Salles de bain</span>
                    <span className="font-medium text-gray-800">{bien.nbSallesDeBain}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Ville</span>
                  <span className="font-medium text-gray-800">{bien.ville}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Formulaire de contact */}
      <ContactForm
        bien={bien}
        proprietaire={bien.proprietaire}
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </>
  );
}
