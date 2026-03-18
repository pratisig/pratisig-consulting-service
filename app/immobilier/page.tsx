import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { MapPin, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ImmobilierPage() {
  let biens: any[] = [];
  try {
    biens = await prisma.bienImmobilier.findMany({
      where: { isPublished: true, statut: 'DISPONIBLE' },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
  } catch {
    biens = [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#1a3a5c] text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">Pratisig <span className="text-[#e8a020]">Immobilier</span></Link>
          <Link href="/auth/login" className="text-sm bg-[#e8a020] px-4 py-2 rounded-lg">
            Publier un bien
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Home className="text-[#1a3a5c]" />
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Biens disponibles</h1>
          <span className="ml-2 bg-[#e8a020] text-white text-xs px-3 py-1 rounded-full">{biens.length}</span>
        </div>

        {biens.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Home size={48} className="mx-auto mb-4 opacity-30" />
            <p>Aucun bien disponible pour le moment.</p>
            <Link href="/auth/register" className="mt-4 inline-block bg-[#1a3a5c] text-white px-6 py-3 rounded-xl">
              Publier le premier bien
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {biens.map((bien) => (
              <div key={bien.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  {bien.photos?.[0] ? (
                    <img src={bien.photos[0]} alt={bien.titre} className="w-full h-full object-cover" />
                  ) : (
                    <Home size={48} className="text-slate-400" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                    <MapPin size={12} />
                    {bien.ville}{bien.quartier ? `, ${bien.quartier}` : ''}
                  </div>
                  <h3 className="font-bold text-[#1a3a5c] mb-1">{bien.titre}</h3>
                  <p className="text-[#e8a020] font-bold">
                    {bien.prix.toLocaleString('fr-FR')} FCFA
                    {bien.transactionType === 'LOCATION' ? '/mois' : ''}
                  </p>
                  <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {bien.transactionType} · {bien.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
