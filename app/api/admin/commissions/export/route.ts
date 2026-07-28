import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Récupérer toutes les commissions avec les détails
    const commissions = await prisma.commission.findMany({
      include: {
        bien: {
          select: {
            titre: true,
            adresse: true,
            type: true,
          },
        },
        proprietaire: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        dateTransaction: 'desc',
      },
    });

    // Calculer les totaux
    const totalCommissions = commissions.reduce((sum, c) => sum + c.montantCommission, 0);
    const payees = commissions.filter(c => c.statut === 'PAYEE');
    const enAttente = commissions.filter(c => c.statut === 'EN_ATTENTE');
    const annulees = commissions.filter(c => c.statut === 'ANNULEE');

    const totalPayees = payees.reduce((sum, c) => sum + c.montantCommission, 0);
    const totalEnAttente = enAttente.reduce((sum, c) => sum + c.montantCommission, 0);

    // Générer le CSV
    const headers = [
      'ID',
      'Date',
      'Bien',
      'Adresse',
      'Type bien',
      'Propriétaire',
      'Email',
      'Téléphone',
      'Type transaction',
      'Montant base',
      'Taux (%)',
      'Commission',
      'Statut',
      'Date paiement',
      'Notes'
    ];

    const rows = commissions.map(c => [
      c.id,
      new Date(c.dateTransaction).toLocaleDateString('fr-FR'),
      c.bien?.titre || 'N/A',
      c.bien?.adresse || 'N/A',
      c.bien?.type || 'N/A',
      c.proprietaire.name || 'N/A',
      c.proprietaire.email,
      c.proprietaire.phone || '',
      c.transactionType,
      c.montantBase.toLocaleString('fr-FR'),
      c.tauxCommission.toString(),
      c.montantCommission.toLocaleString('fr-FR'),
      c.statut,
      c.datePaiement ? new Date(c.datePaiement).toLocaleDateString('fr-FR') : '',
      c.notes || ''
    ]);

    // Résumé
    const summary = [
      [],
      ['RÉSUMÉ', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Total commissions', '', '', '', '', '', '', '', '', '', '', totalCommissions.toLocaleString('fr-FR'), '', '', ''],
      ['Payées', '', '', '', '', '', '', '', '', '', '', totalPayees.toLocaleString('fr-FR'), '', '', `${payees.length} transaction(s)`],
      ['En attente', '', '', '', '', '', '', '', '', '', '', totalEnAttente.toLocaleString('fr-FR'), '', '', `${enAttente.length} transaction(s)`],
      ['Annulées', '', '', '', '', '', '', '', '', '', '', '0', '', '', `${annulees.length} transaction(s)`],
    ];

    const csvContent = [
      ['RAPPORT DES COMMISSIONS - PRATISIG CONSULTING SERVICE'],
      [`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`],
      [],
      headers,
      ...rows,
      ...summary
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=commissions_${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Erreur export CSV:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
