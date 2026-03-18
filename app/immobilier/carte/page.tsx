import { prisma } from '@/lib/db/prisma';
import CarteImmobilier from '@/components/immobilier/CarteImmobilier';
import Link from 'next/link';
import { ArrowLeft, Map } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CartePage() {
  const biens = await prisma.bienImmobilier.findMany({
    where: { isPublished: true, statut: 'DISPONIBLE', latitude: { not: null }, longitude: { not: null } },
    select: { id: true, titre: true, prix: true, latitude: true, longitude: true, transactionType: true, type: true },
  }).catch(() => []);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#1a3a5c] text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/immobilier" className="hover:text-[#e8a020]"><ArrowLeft size={20} /></Link>
          <Map size={20} className="text-[#e8a020]" />
          <span className="font-bold">Carte des biens</span>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-gray-500 text-sm mb-4">{biens.length} bien(s) géolocalisé(s) · Cliquez sur un marqueur pour la fiche</p>
        <CarteImmobilier biens={biens as any} />
      </div>
    </main>
  );
}
