'use client';

import { useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface GenerateFactureProps {
  commandeId: string;
  disabled?: boolean;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function GenerateFacture({ commandeId, disabled }: GenerateFactureProps) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Récupérer les données de la facture
      const res = await fetch(`/api/factures/${commandeId}`);
      if (!res.ok) throw new Error('Erreur lors de la récupération de la facture');

      const data = await res.json();

      // Créer le PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // En-tête avec logo et infos entreprise
      if (data.config.logo) {
        try {
          doc.addImage(data.config.logo, 'PNG', 14, 10, 40, 20);
        } catch {
          // Logo non chargé, continuer sans
        }
      }

      // Infos entreprise (alignées à droite si logo)
      const startX = data.config.logo ? 60 : 14;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(data.config.nomEntreprise || 'Pratisig Consulting Service', startX, 15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 22;

      if (data.config.adresse) {
        doc.text(data.config.adresse, startX, yPos);
        yPos += 5;
      }
      if (data.config.ville || data.config.pays) {
        doc.text(`${data.config.ville || ''}, ${data.config.pays || ''}`.trim(), startX, yPos);
        yPos += 5;
      }
      if (data.config.telephone) {
        doc.text(`Tél: ${data.config.telephone}`, startX, yPos);
        yPos += 5;
      }
      if (data.config.email) {
        doc.text(`Email: ${data.config.email}`, startX, yPos);
        yPos += 5;
      }
      if (data.config.siteWeb) {
        doc.text(`Web: ${data.config.siteWeb}`, startX, yPos);
      }

      // Ligne de séparation
      yPos += 5;
      doc.setDrawColor(26, 58, 92);
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 10;

      // Titre Facture
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 58, 92);
      doc.text('FACTURE', pageWidth - 14, yPos, { align: 'right' });
      yPos += 8;

      // Numéro et date
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`N° ${data.numero}`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 6;
      doc.text(`Date: ${data.date}`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 10;

      // Infos client
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURÉ À:', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(data.client.nom, 14, yPos);
      yPos += 5;
      if (data.client.adresse) {
        doc.text(data.client.adresse, 14, yPos);
        yPos += 5;
      }
      if (data.client.ville) {
        doc.text(data.client.ville, 14, yPos);
        yPos += 5;
      }
      if (data.client.telephone) {
        doc.text(`Tél: ${data.client.telephone}`, 14, yPos);
        yPos += 5;
      }
      if (data.client.email) {
        doc.text(`Email: ${data.client.email}`, 14, yPos);
      }
      yPos += 10;

      // Tableau des articles
      const tableData = data.lignes.map((ligne: any) => [
        ligne.nom,
        ligne.quantite.toString(),
        `${ligne.prixUnit.toLocaleString('fr-FR')} F`,
        `${ligne.total.toLocaleString('fr-FR')} F`,
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Désignation', 'Qté', 'Prix unitaire', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [26, 58, 92],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Totaux
      const totalWidth = 80;
      const totalX = pageWidth - 14 - totalWidth;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Sous-total:', totalX, yPos);
      doc.text(`${data.sousTotal.toLocaleString('fr-FR')} FCFA`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 6;

      if (data.reduction > 0) {
        doc.setTextColor(231, 76, 60);
        doc.text(`Réduction:`, totalX, yPos);
        doc.text(`-${data.reduction.toLocaleString('fr-FR')} FCFA`, pageWidth - 14, yPos, { align: 'right' });
        yPos += 6;
        doc.setTextColor(0, 0, 0);
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', totalX, yPos);
      doc.text(`${data.total.toLocaleString('fr-FR')} FCFA`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 10;

      // Mode de paiement et statut
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mode de paiement: ${data.modePaiement}`, 14, yPos);
      yPos += 6;
      doc.text(`Statut: ${data.statut}`, 14, yPos);
      yPos += 10;

      // Conditions
      if (data.config.conditions) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Conditions:', 14, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const splitConditions = doc.splitTextToSize(data.config.conditions, pageWidth - 28);
        doc.text(splitConditions, 14, yPos);
        yPos += (splitConditions as string[]).length * 4 + 10;
      }

      // Pied de page
      if (data.config.piedPage || data.config.ninea || data.config.rccm) {
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPos, pageWidth - 14, yPos);
        yPos += 5;

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        if (data.config.piedPage) {
          doc.text(data.config.piedPage, 14, yPos);
          yPos += 4;
        }
        if (data.config.ninea) {
          doc.text(`NINEA: ${data.config.ninea}`, 14, yPos);
          yPos += 4;
        }
        if (data.config.rccm) {
          doc.text(`RCCM: ${data.config.rccm}`, 14, yPos);
        }
      }

      // Télécharger le PDF
      doc.save(`facture-${data.numero}.pdf`);
      toast.success('Facture téléchargée avec succès !');
    } catch (error: any) {
      console.error('Erreur génération facture:', error);
      toast.error(error.message || 'Erreur lors de la génération de la facture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading || disabled}
      className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#0d2440] disabled:opacity-50 transition-colors text-sm font-medium"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {loading ? 'Génération...' : 'Télécharger Facture'}
    </button>
  );
}
