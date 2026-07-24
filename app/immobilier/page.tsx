import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { MapPin, Home, Phone, Eye, Mail, Map as MapIcon, Building2 } from 'lucide-react';
import CarteBiens from './CarteBiens';

export const dynamic = 'force-dynamic';

export default async function ImmobilierPage() {
  let biens: any[] = [];
  let biensWithCoords: any[] = [];
  
  try {
    biens = await prisma.bienImmobilier.findMany({
      where: { isActive: true, isPublished: true, statut: 'DISPONIBLE' },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        proprietaire: {
          select: { name: true, phone: true, email: true, whatsapp: true }
        }
      }
    });
    
    // Filter biens with coordinates for the map
    biensWithCoords = biens.filter(b => b.latitude && b.longitude);
  } catch {
    biens = [];
    biensWithCoords = [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#1a3a5c] text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">Pratisig <span className="text-[#e8a020]">Immobilier</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/immobilier/carte" className="text-sm flex items-center gap-1 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20">
              <MapIcon size={16} /> Carte
            </Link>
            <Link href="/login" className="text-sm bg-[#e8a020] px-4 py-2 rounded-lg hover:bg-[#d4911d]">
              Publier un bien
            </Link>
          </div>
        </div>
      </header>

      {/* Map Section */}
      {biensWithCoords.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon size={18} className="text-[#1a3a5c]" />
                <h2 className="font-bold text-[#1a3a5c]">Localisation des biens</h2>
              </div>
              <span className="text-xs text-gray-500">{biensWithCoords.length} bien{biensWithCoords.length > 1 ? 's' : ''} géolocalisé{biensWithCoords.length > 1 ? 's' : ''}</span>
            </div>
            <CarteBiens biens={biensWithCoords} />
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="text-[#1a3a5c]" />
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Biens disponibles</h1>
          <span className="ml-2 bg-[#e8a020] text-white text-xs px-3 py-1 rounded-full">{biens.length}</span>
        </div>

        {biens.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Home size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucun bien disponible pour le moment.</p>
            <Link href="/register" className="mt-4 inline-block bg-[#1a3a5c] text-white px-6 py-3 rounded-xl">
              Publier le premier bien
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {biens.map((bien) => (
              <div key={bien.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center relative">
                  {bien.images?.[0] ? (
                    <img src={bien.images[0]} alt={bien.titre} className="w-full h-full object-cover" />
                  ) : (
                    <Home size={48} className="text-slate-400" />
                  )}
                  <span className="absolute top-2 right-2 text-xs bg-white/90 text-[#1a3a5c] px-2 py-1 rounded-full font-medium">
                    {bien.prixVente ? 'À vendre' : 'À louer'}
                  </span>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                    <MapPin size={12} />
                    {bien.ville}{bien.quartier ? `, ${bien.quartier}` : ''}
                  </div>
                  <h3 className="font-bold text-[#1a3a5c] mb-1">{bien.titre}</h3>
                  <p className="text-[#e8a020] font-bold text-lg mb-2">
                    {bien.prixVente ? `${bien.prixVente.toLocaleString('fr-FR')} FCFA` : `${(bien.prixLoyer ?? 0).toLocaleString('fr-FR')} FCFA/mois`}
                  </p>
                  <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full self-start mb-3">
                    {bien.type}
                  </span>
                  
                  {/* Spacer */}
                  <div className="flex-1" />
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Link 
                      href={`/immobilier/${bien.id}`}
                      className="flex-1 bg-[#1a3a5c] text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-[#0d2440] transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={14} /> Voir
                    </Link>
                    {bien.proprietaire?.phone ? (
                      <a 
                        href={`tel:${bien.proprietaire.phone}`}
                        className="flex-1 bg-[#e8a020] text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-[#d4911d] transition-colors flex items-center justify-center gap-1"
                      >
                        <Phone size={14} /> Contacter
                      </a>
                    ) : bien.proprietaire?.email ? (
                      <a 
                        href={`mailto:${bien.proprietaire.email}`}
                        className="flex-1 bg-[#e8a020] text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-[#d4911d] transition-colors flex items-center justify-center gap-1"
                      >
                        <Mail size={14} /> Email
                      </a>
                    ) : (
                      <Link 
                        href={`/immobilier/${bien.id}`}
                        className="flex-1 bg-[#e8a020] text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-[#d4911d] transition-colors flex items-center justify-center gap-1"
                      >
                        <Phone size={14} /> Contacter
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
