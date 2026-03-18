import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Home, BedDouble, Bath, Ruler, ArrowLeft, Phone } from 'lucide-react';

export default async function FicheBienPage({ params }: { params: { id: string } }) {
  const bien = await prisma.bienImmobilier.findUnique({
    where: { id: params.id, isPublished: true },
    include: { proprietaire: { select: { name: true, phone: true, email: true } } },
  }).catch(() => null);

  if (!bien) notFound();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#1a3a5c] text-white px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/immobilier" className="hover:text-[#e8a020] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-bold">Fiche du bien</span>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl overflow-hidden h-72 bg-slate-200">
            {bien.photos?.[0] ? (
              <img src={bien.photos[0]} alt={bien.titre} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Home size={64} className="text-slate-400" /></div>
            )}
          </div>
          {bien.photos?.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {bien.photos.slice(1, 4).map((p: string, i: number) => (
                <div key={i} className="h-24 rounded-xl overflow-hidden bg-slate-200">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="bg-white rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-[#1a3a5c] mb-2">{bien.titre}</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <MapPin size={14} /> {bien.adresse}, {bien.ville}{bien.quartier ? ` — ${bien.quartier}` : ''}
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {bien.surface && <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-sm"><Ruler size={14} />{bien.surface} m²</span>}
              {bien.nbChambres && <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-sm"><BedDouble size={14} />{bien.nbChambres} chambre(s)</span>}
              {bien.nbSallesDeBain && <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-sm"><Bath size={14} />{bien.nbSallesDeBain} sdb</span>}
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{bien.type}</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{bien.transactionType}</span>
            </div>
            <h2 className="font-semibold text-[#1a3a5c] mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">{bien.description}</p>
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow">
            <p className="text-3xl font-bold text-[#e8a020] mb-1">
              {bien.prix.toLocaleString('fr-FR')} FCFA
              {bien.transactionType === 'LOCATION' ? <span className="text-sm font-normal text-gray-500">/mois</span> : ''}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              bien.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
              bien.statut === 'RESERVE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>{bien.statut}</span>
            <hr className="my-4" />
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-semibold">Propriétaire :</span> {bien.proprietaire?.name ?? 'N/A'}</p>
              {bien.proprietaire?.phone && (
                <a href={`tel:${bien.proprietaire.phone}`} className="flex items-center gap-2 text-[#1a3a5c] font-semibold hover:underline">
                  <Phone size={14} /> {bien.proprietaire.phone}
                </a>
              )}
            </div>
            <Link href={`/auth/register`} className="mt-4 block w-full bg-[#1a3a5c] text-white text-center py-3 rounded-xl font-semibold hover:bg-[#0d2440] transition-colors">
              Faire une demande
            </Link>
          </div>
          {bien.latitude && bien.longitude && (
            <div className="bg-white rounded-2xl p-4 shadow">
              <p className="font-semibold text-[#1a3a5c] mb-2 text-sm">📍 Localisation</p>
              <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-xs">
                Carte : {bien.latitude.toFixed(4)}, {bien.longitude.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
