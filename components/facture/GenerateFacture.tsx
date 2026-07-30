'use client';

import { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface GenerateFactureProps {
  commande: {
    id: string;
    total: number;
    modePaiement: string;
    statut: string;
    adresseLivraison: string;
    villeLivraison: string;
    telephoneClient: string;
    notesClient?: string | null;
    createdAt: string;
    client: {
      name: string | null;
      email: string;
      phone?: string | null;
    };
    lignes: Array<{
      quantite: number;
      prixUnit: number;
      total: number;
      produit: {
        nom: string;
        prix: number;
      };
    }>;
  };
}

export default function GenerateFacture({ commande }: GenerateFactureProps) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Créer le document PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // En-tête
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 58, 92);
      doc.text('FACTURE', pageWidth - 14, 20, { align: 'right' });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const numeroFacture = `FAC-${new Date().getFullYear()}-${commande.id.slice(0, 6).toUpperCase()}`;
      doc.text(`N° ${numeroFacture}`, pageWidth - 14, 28, { align: 'right' });
      doc.text(`Date: ${new Date(commande.createdAt).toLocaleDateString('fr-FR')}`, pageWidth - 14, 34, { align: 'right' });

      // Informations entreprise
      doc.setFontSize(14);
      doc.setTextColor(26, 58, 92);
      doc.text('Pratisig Consulting Service', 14, 20);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Dakar, Sénégal', 14, 26);
      doc.text('contact@pratisig.sn', 14, 31);

      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 40, pageWidth - 14, 40);

      // Informations client
      let yPos = 50;
      doc.setFontSize(10);
      doc.setTextColor(26, 58, 92);
      doc.text('FACTURÉ À:', 14, yPos);
      yPos += 6;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.text(commande.client.name || 'Client', 14, yPos);
      yPos += 5;
      doc.text(commande.client.email, 14, yPos);
      yPos += 5;
      if (commande.client.phone || commande.telephoneClient) {
        doc.text(commande.client.phone || commande.telephoneClient, 14, yPos);
        yPos += 5;
      }
      doc.text(commande.adresseLivraison, 14, yPos);
      yPos += 5;
      doc.text(commande.villeLivraison, 14, yPos);
      yPos += 10;

      // Tableau des articles
      const tableData = commande.lignes.map((ligne) => [
        ligne.produit.nom,
        ligne.quantite.toString(),
        `${ligne.prixUnit.toLocaleString('fr-FR')} F`,
        `${ligne.total.toLocaleString('fr-FR')} F`,
      ]);

      autoTable(doc, {
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
          fontSize: 9,
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

      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text('Sous-total:', totalX, yPos);
      doc.text(`${commande.total.toLocaleString('fr-FR')} FCFA`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 6;

      doc.setFontSize(11);
      doc.setTextColor(26, 58, 92);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', totalX, yPos);
      doc.text(`${commande.total.toLocaleString('fr-FR')} FCFA`, pageWidth - 14, yPos, { align: 'right' });
      yPos += 10;

      // Mode de paiement et statut
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mode de paiement: ${commande.modePaiement}`, 14, yPos);
      yPos += 5;
      doc.text(`Statut: ${commande.statut}`, 14, yPos);
      yPos += 10;

      // Notes
      if (commande.notesClient) {
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text('Notes:', 14, yPos);
        yPos += 5;
        const splitNotes = doc.splitTextToSize(commande.notesClient, pageWidth - 28);
        doc.text(splitNotes, 14, yPos);
        yPos += (splitNotes as string[]).length * 4 + 10;
      }

      // Pied de page
      yPos = doc.internal.pageSize.getHeight() - 20;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos - 5, pageWidth - 14, yPos - 5);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Merci de votre confiance !', pageWidth / 2, yPos, { align: 'center' });
      doc.text('Pratisig Consulting Service - Dakar, Sénégal', pageWidth / 2, yPos + 5, { align: 'center' });

      // Télécharger le PDF
      doc.save(`facture-${numeroFacture}.pdf`);
      toast.success('Facture téléchargée avec succès !');
    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast.error('Erreur lors de la génération de la facture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#0d2440] disabled:opacity-50 transition-colors text-sm font-medium"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {loading ? 'Génération...' : 'Télécharger Facture'}
    </button>
  );
}
