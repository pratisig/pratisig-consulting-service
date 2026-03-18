import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, BedDouble, Bath, Maximize2, Phone, Mail, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DetailBienPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/auth/login');

  const bien = await prisma.bienImmobilier.findUnique({
    where: { id: params.id },
    include: {
      proprietaire: { select: { name: true, phone: true, email: true } },
      demandesVisite: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!bien) notFound();

  const user = (session.user as any);
  const isOwner = bien.proprietaireId === user.id;
  const isAdmin = ['ADMIN','SUPER_ADMIN','GERANT'].includes(user.role);

  const STATUT_COLORS: Record<string,string> = {
    DISPONIBLE: 'bg-green-100 text-green-700',
    LOUE: 'bg-blue-100 text-blue-700',
    VENDU: 'bg-gray-100 text-gray-500',
    RESERVE: 'bg-yellow-100 text-yellow-700',
    INDISPONIBLE: 'bg-red-100 text-red-700',
  };

  const TYPE_EMOJI: Record<string,string> = {
    APPARTEMENT:'🏢', VILLA:'🏡', STUDIO:'🚪', BUREAU:'🏛️', COMMERCE:'🏪', TERRAIN:'🌱', ENTREPOT:'🏗️',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/immobilier" className="text-gray-400 hover:text-[#1a3a5c]"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-[#1a3a5c] truncate">{bien.titre}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[bien.statut]}`}>{bien.statut}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image */}
            <div className="bg-white rounded-2xl shadow h-56 flex items-center justify-center">
              <span className="text-8xl">{TYPE_EMOJI[bien.type] ?? '🏠'}</span>
            </div>

            {/* Infos clés */}
            <div className="bg-white rounded-2xl shadow p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {bien.surface && (
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <Maximize2 size={18} className="text-[#1a3a5c] mb-1" />
                    <span className="font-bold text-[#1a3a5c]">{bien.surface} m²</span>
                    <span className="text-xs text-gray-400">Surface</span>
                  </div>
                )}
                {bien.nbChambres && (
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <BedDouble size={18} className="text-[#1a3a5c] mb-1" />
                    <span className="font-bold text-[#1a3a5c]">{bien.nbChambres}</span>
                    <span className="text-xs text-gray-400">Chambres</span>
                  </div>
                )}
                {bien.nbSallesDeBain && (
                  <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                    <Bath size={18} className="text-[#1a3a5c] mb-1" />
                    <span className="font-bold text-[#1a3a5c]">{bien.nbSallesDeBain}</span>
                    <span className="text-xs text-gray-400">SdB</span>
                  </div>
                )}
                <div className="flex flex-col items-center p-3 bg-slate-50 rounded-xl">
                  <MapPin size={18} className="text-[#1a3a5c] mb-1" />
                  <span className="font-bold text-[#1a3a5c] text-xs text-center">{bien.quartier ?? bien.ville}</span>
                  <span className="text-xs text-gray-400">Zone</span>
                </div>
              </div>

              {/* Prix */}
              <div className="flex gap-4 mb-4">
                {bien.prixLoyer && (
                  <div className="flex-1 bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Loyer mensuel</p>
                    <p className="text-xl font-bold text-[#e8a020]">{bien.prixLoyer.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                )}
                {bien.prixVente && (
                  <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Prix de vente</p>
                    <p className="text-xl font-bold text-[#1a3a5c]">{bien.prixVente.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                <MapPin size={14} />
                <span>{bien.adresse}</span>
              </div>

              {bien.description && (
                <p className="text-gray-600 text-sm leading-relaxed">{bien.description}</p>
              )}
            </div>

            {/* Demandes de visite (owner/admin) */}
            {(isOwner || isAdmin) && bien.demandesVisite.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
                  <Calendar size={18} /> Demandes de visite ({bien.demandesVisite.length})
                </h2>
                <div className="space-y-3">
                  {bien.demandesVisite.map((dv) => (
                    <div key={dv.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#1a3a5c] text-sm">{dv.nomClient}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          dv.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{dv.statut}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Phone size={10} />{dv.telClient}</span>
                        {dv.emailClient && <span className="flex items-center gap-1"><Mail size={10} />{dv.emailClient}</span>}
                      </div>
                      {dv.message && <p className="text-xs text-gray-400 mt-1">{dv.message}</p>}
                      <p className="text-xs text-gray-300 mt-1">{new Date(dv.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar contact */}
          <div className="space-y-4">
            {/* Propriétaire */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-bold text-[#1a3a5c] mb-3 text-sm">Contact propriétaire</h3>
              <p className="font-semibold text-[#1a3a5c]">{bien.proprietaire.name ?? 'Propriétaire'}</p>
              {bien.proprietaire.phone && (
                <a href={`tel:${bien.proprietaire.phone}`} className="flex items-center gap-2 mt-2 text-sm text-[#1a3a5c] hover:text-[#e8a020] transition-colors">
                  <Phone size={14} /> {bien.proprietaire.phone}
                </a>
              )}
              {bien.proprietaire.email && (
                <a href={`mailto:${bien.proprietaire.email}`} className="flex items-center gap-2 mt-1 text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors">
                  <Mail size={14} /> {bien.proprietaire.email}
                </a>
              )}
            </div>

            {/* Formulaire demande de visite */}
            {!isOwner && !isAdmin && (
              <DemandeVisiteForm bienId={bien.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant client pour le formulaire
function DemandeVisiteForm({ bienId }: { bienId: string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h3 className="font-bold text-[#1a3a5c] mb-4 text-sm">Demander une visite</h3>
      <form action={`/api/immobilier/biens/${bienId}/visite`} method="POST" className="space-y-3">
        <input name="nomClient" required placeholder="Votre nom *"
          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
        <input name="telClient" required placeholder="Téléphone *"
          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
        <input name="emailClient" type="email" placeholder="Email"
          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
        <textarea name="message" rows={2} placeholder="Message..."
          className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
        <button type="submit" className="w-full bg-[#1a3a5c] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0d2440] transition-colors">
          Envoyer la demande
        </button>
      </form>
    </div>
  );
}
