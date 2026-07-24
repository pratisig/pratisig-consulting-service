import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Home, BedDouble, Bath, Ruler, ArrowLeft, Phone, Mail, MessageCircle, Eye, Tag, Calendar, Maximize2 } from 'lucide-react';
import BienMap from '@/components/immobilier/BienMap';

export default async function FicheBienPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bien = await prisma.bienImmobilier.findFirst({
    where: { id, isActive: true },
    include: { proprietaire: { select: { name: true, phone: true, email: true } } },
  }).catch(() => null);

  if (!bien) notFound();

  const fullAddress = [bien.adresse, bien.quartier, bien.ville].filter(Boolean).join(', ');
  const prix = bien.prixVente 
    ? `${bien.prixVente.toLocaleString('fr-FR')} FCFA`
    : `${(bien.prixLoyer ?? 0).toLocaleString('fr-FR')} FCFA/mois`;
  
  // Format phone for WhatsApp (remove + and spaces)
  const whatsappNumber = bien.proprietaire?.phone?.replace(/[\s+\-()]/g, '') || '';

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#1a3a5c] text-white px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/immobilier" className="hover:text-[#e8a020] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-bold">Fiche du bien</span>
          </div>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
            {bien.type}
          </span>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photos et détails */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image principale */}
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
            
            {/* Description */}
            <h2 className="font-semibold text-[#1a3a5c] mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{bien.description || 'Aucune description fournie.'}</p>
          </div>

          {/* Carte */}
          {bien.latitude && bien.longitude && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-[#1a3a5c] mb-3 flex items-center gap-2">
                <MapPin size={16} /> Localisation
              </h2>
              <BienMap
                lat={bien.latitude}
                lon={bien.longitude}
                title={bien.titre}
                address={fullAddress}
              />
            </div>
          )}
        </div>
        
        {/* Sidebar - Contact */}
        <div className="space-y-4">
          {/* Prix */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-3xl font-bold text-[#e8a020] mb-1">{prix}</p>
            <p className="text-xs text-gray-500 mb-3">
              {bien.prixVente ? 'Prix de vente' : 'Loyer mensuel'}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              bien.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
              bien.statut === 'RESERVE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>{bien.statut}</span>
          </div>
          
          {/* Contact */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
              <Phone size={16} /> Contacter le propriétaire
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
              {bien.proprietaire?.phone && (
                <a 
                  href={`tel:${bien.proprietaire.phone}`}
                  className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={16} /> Appeler
                </a>
              )}
              
              {bien.proprietaire?.phone && whatsappNumber && (
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=Bonjour, je suis intéressé(e) par votre bien "${bien.titre}" sur Pratisig.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-3 rounded-xl font-semibold hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
              )}
              
              {bien.proprietaire?.email && (
                <a 
                  href={`mailto:${bien.proprietaire.email}?subject=Demande concernant: ${bien.titre}`}
                  className="w-full bg-gray-100 text-[#1a3a5c] py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border"
                >
                  <Mail size={16} /> Envoyer un email
                </a>
              )}
              
              <Link 
                href="/register"
                className="w-full bg-[#e8a020] text-white py-3 rounded-xl font-semibold hover:bg-[#d4911d] transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Faire une offre
              </Link>
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
  );
}
