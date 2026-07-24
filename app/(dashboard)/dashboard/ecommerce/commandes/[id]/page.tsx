import { getCurrentUser } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ArrowLeft, Package, User, MapPin, Phone, Mail, FileText } from 'lucide-react';
import GenerateFacture from '@/components/facture/GenerateFacture';

export default async function CommandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user) redirect('/login');
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER_ECOMMERCE'].includes(user.role)) {
    redirect('/dashboard');
  }

  const commande = await prisma.commande.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      lignes: {
        include: {
          produit: {
            select: {
              nom: true,
              prix: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!commande) notFound();

  const STATUT_COLORS: Record<string, string> = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    CONFIRMEE: 'bg-blue-100 text-blue-700',
    EN_PREPARATION: 'bg-purple-100 text-purple-700',
    EXPEDIEE: 'bg-orange-100 text-orange-700',
    LIVREE: 'bg-green-100 text-green-700',
    ANNULEE: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/ecommerce" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a3a5c]">Commande #{commande.id.slice(0, 8).toUpperCase()}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[commande.statut]}`}>
            {commande.statut.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails de la commande */}
          <div className="lg:col-span-2 space-y-6">
            {/* Articles */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
                <Package size={18} /> Articles commandés
              </h2>
              <div className="space-y-3">
                {commande.lignes.map((ligne) => (
                  <div key={ligne.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#1a3a5c]">{ligne.produit.nom}</p>
                      <p className="text-sm text-gray-500">
                        {ligne.quantite} × {ligne.prixUnit.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                    <p className="font-bold text-[#e8a020]">{ligne.total.toLocaleString('fr-FR')} F</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totaux */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-[#1a3a5c] mb-4">Récapitulatif</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{commande.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
                {(commande as any).reduction && (commande as any).reduction > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Réduction</span>
                    <span className="text-red-600">-{(commande as any).reduction.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-[#e8a020]">
                    {((commande as any).totalFinal || commande.total - ((commande as any).reduction || 0)).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-gray-600">Mode de paiement</span>
                  <span className="font-medium">{commande.modePaiement}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
                <User size={18} /> Client
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{commande.client.name || 'Non renseigné'}</p>
                </div>
                {commande.client.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail size={12} /> {commande.client.email}
                    </p>
                  </div>
                )}
                {(commande.client.phone || commande.telephoneClient) && (
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone size={12} /> {commande.client.phone || commande.telephoneClient}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Adresse de livraison */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
                <MapPin size={18} /> Adresse de livraison
              </h2>
              <p className="text-gray-700">{commande.adresseLivraison}</p>
              <p className="text-sm text-gray-500 mt-2">{commande.villeLivraison}</p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow space-y-3">
              <h2 className="font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
                <FileText size={18} /> Actions
              </h2>
              {commande.statut === 'LIVREE' && (
                <GenerateFacture commandeId={commande.id} />
              )}
              <p className="text-xs text-gray-500">
                La facture est disponible une fois la commande livrée.
              </p>
            </div>

            {/* Informations */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="font-bold text-[#1a3a5c] mb-4">Informations</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Créée le</span>
                  <span>{new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}</span>
                </div>
                {(commande as any).numeroFacture && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Facture</span>
                    <span className="font-mono text-xs">{(commande as any).numeroFacture}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
