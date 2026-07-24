'use client';

import { useState } from 'react';
import { Phone, Mail, MessageCircle, Send, X } from 'lucide-react';

interface ContactFormProps {
  bien: {
    id: string;
    titre: string;
    ville: string;
    quartier?: string | null;
    prixLoyer?: number | null;
    prixVente?: number | null;
  };
  proprietaire: {
    name?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactForm({ bien, proprietaire, isOpen, onClose }: ContactFormProps) {
  const prix = bien.prixVente 
    ? `${bien.prixVente.toLocaleString('fr-FR')} FCFA (vente)`
    : `${bien.prixLoyer?.toLocaleString('fr-FR')} FCFA/mois (location)`;
  
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: `Bonjour ${proprietaire.name || ''},\n\nJe suis intéressé(e) par votre bien "${bien.titre}" à ${bien.ville}${bien.quartier ? ` (${bien.quartier})` : ''} au prix de ${prix}.\n\nPourriez-vous me donner plus d'informations ?\n\nMerci.\n\nVoir l'annonce: ${typeof window !== 'undefined' ? window.location.origin : ''}/immobilier/${bien.id}`,
  });

  if (!isOpen) return null;

  const whatsappNumber = proprietaire.whatsapp?.replace(/[\s+\-()]/g, '') || '';
  const whatsappMessage = encodeURIComponent(form.message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  
  const mailtoSubject = encodeURIComponent(`Intérêt pour: ${bien.titre}`);
  const mailtoBody = encodeURIComponent(form.message);
  const mailtoUrl = proprietaire.email 
    ? `mailto:${proprietaire.email}?subject=${mailtoSubject}&body=${mailtoBody}`
    : '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1a3a5c]">Contacter le propriétaire</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">{bien.titre}</p>
            <p className="text-xs text-blue-700">
              {bien.ville}{bien.quartier ? ` - ${bien.quartier}` : ''} • {prix}
            </p>
          </div>

          {/* Boutons de contact rapide */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {proprietaire.whatsapp && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            )}
            {proprietaire.phone && (
              <a
                href={`tel:${proprietaire.phone}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a3a5c] text-white rounded-lg font-medium hover:bg-[#0d2440] transition-colors"
              >
                <Phone className="w-5 h-5" />
                Appeler
              </a>
            )}
            {proprietaire.email && (
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors col-span-2"
              >
                <Mail className="w-5 h-5" />
                Email
              </a>
            )}
          </div>

          {/* Formulaire de message */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre nom
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="jean@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre téléphone
              </label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                placeholder="+221 77 123 45 67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Vous pouvez modifier ce message avant de l'envoyer
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                💡 Le message sera envoyé via WhatsApp, email ou téléphone selon le bouton choisi ci-dessus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
