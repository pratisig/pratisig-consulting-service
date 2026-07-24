import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Package, Clock, User, Phone, Navigation } from 'lucide-react';
import LivraisonMap from '@/components/livraison/LivraisonMap';
import StatutModifier from '@/components/livraison/StatutModifier';
import { getCurrentUser } from '@/lib/auth/session';

export default async function LivraisonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) notFound();
  
  const { id } = await params;
  
  const livraison = await prisma.livraison.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, phone: true, email: true } },
      livreur: { select: { name: true, phone: true } },
      zone: true,
    },
  }).catch(() => null);

  if (!livraison) notFound();

  // Vérifier les permissions
  const canView = 
    user.role === 'SUPER_ADMIN' || 
    user.role === 'ADMIN' || 
    user.role === 'MANAGER_LIVRAISON' ||
    user.role === 'LIVREUR' ||
    livraison.clientId === user.id;

  if (!canView) notFound();

  const STATUT_COLORS: Record<string, string> = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    ACCEPTEE: 'bg-blue-100 text-blue-700',
    EN_ROUTE_COLLECTE: 'bg-purple-100 text-purple-700',
    COLLECTE: 'bg-indigo-100 text-indigo-700',
    EN_ROUTE_LIVRAISON: 'bg-orange-100 text-orange-700',
    LIVREE: 'bg-green-100 text-green-700',
    ANNULEE: 'bg-red-100 text-red-700',
  };

  const STATUT_LABELS: Record<string, string> = {
    EN_ATTENTE: 'En attente d\'un livreur',
    ACCEPTEE: 'Livreur assigné',
    EN_ROUTE_COLLECTE: 'En route vers le colis',
    COLLECTE: 'Colis récupéré',
    EN_ROUTE_LIVRAISON: 'En route vers la destination',
    LIVREE: 'Livrée',
    ANNULEE: 'Annulée',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/livraison" className="text-gray-400 hover:text-[#1a3a5c]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">Détails de la livraison</h1>
            <p className="text-sm text-gray-500">Commande #{livraison.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Statut */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1a3a5c]">Statut</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUT_COLORS[livraison.statut]}`}>
              {STATUT_LABELS[livraison.statut]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>Créée le {new Date(livraison.createdAt).toLocaleDateString('fr-FR', { 
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}</span>
          </div>
        </div>

        {/* Carte */}
        {livraison.latCollecte && livraison.lngCollecte && livraison.latDest && livraison.lngDest && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-[#1a3a5c] mb-4 flex items-center gap-2">
              <Navigation size={20} /> Itinéraire
            </h2>
            <LivraisonMap
              latCollecte={livraison.latCollecte}
              lngCollecte={livraison.lngCollecte}
              latDest={livraison.latDest}
              lngDest={livraison.lngDest}
              adresseCollecte={livraison.adresseCollecte}
              adresseDest={livraison.adresseDest}
              livreurLat={livraison.livreurLat}
              livreurLng={livraison.livreurLng}
            />
          </div>
        )}

        {/* Points de livraison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Collecte */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin size={16} className="text-green-600" />
              </div>
              <h3 className="font-bold text-green-700">Point de collecte</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{livraison.adresseCollecte}</p>
            {livraison.latCollecte && livraison.lngCollecte && (
              <p className="text-xs text-gray-400 mt-2 font-mono">
                {livraison.latCollecte.toFixed(6)}, {livraison.lngCollecte.toFixed(6)}
              </p>
            )}
          </div>

          {/* Destination */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <MapPin size={16} className="text-red-600" />
              </div>
              <h3 className="font-bold text-red-700">Point de livraison</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{livraison.adresseDest}</p>
            {livraison.latDest && livraison.lngDest && (
              <p className="text-xs text-gray-400 mt-2 font-mono">
                {livraison.latDest.toFixed(6)}, {livraison.lngDest.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-[#1a3a5c] mb-3 flex items-center gap-2">
              <User size={16} /> Client
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">{livraison.client.name || 'Client'}</p>
              {livraison.client.phone && (
                <a href={`tel:${livraison.client.phone}`} className="flex items-center gap-2 text-[#1a3a5c] hover:underline">
                  <Phone size={14} /> {livraison.client.phone}
                </a>
              )}
            </div>
          </div>

          {/* Livreur */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-[#1a3a5c] mb-3 flex items-center gap-2">
              <User size={16} /> Livreur
            </h3>
            {livraison.livreur ? (
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">{livraison.livreur.name}</p>
                {livraison.livreur.phone && (
                  <a href={`tel:${livraison.livreur.phone}`} className="flex items-center gap-2 text-[#1a3a5c] hover:underline">
                    <Phone size={14} /> {livraison.livreur.phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">En attente d&apos;un livreur...</p>
            )}
          </div>
        </div>

        {/* Modifier le statut (pour admins et livreurs) */}
        {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'MANAGER_LIVRAISON' || user.role === 'LIVREUR') && (
          <StatutModifier
            livraisonId={livraison.id}
            statutActuel={livraison.statut}
            userRole={user.role}
          />
        )}

        {/* Prix et Description */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1a3a5c] flex items-center gap-2">
              <Package size={16} /> Colis
            </h3>
            <p className="text-2xl font-bold text-[#e8a020]">
              {livraison.prix.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          {livraison.description && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-gray-700 text-sm">{livraison.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
