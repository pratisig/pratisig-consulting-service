import { z } from 'zod';

const ligneCommandeSchema = z.object({
  produitId: z.string().cuid(),
  quantite: z.number().int().positive().max(100),
});

export const commandeSchema = z.object({
  lignes: z.array(ligneCommandeSchema).min(1, 'Panier vide').max(20),
  modePaiement: z.enum(['ESPECES','WAVE','ORANGE_MONEY','LIVRAISON']),
  adresseLivraison: z.string().min(10).max(300),
  villeLivraison: z.string().min(2).max(100),
  telephoneClient: z.string().min(8).max(20),
  notesClient: z.string().max(500).optional(),
});

export type CommandeInput = z.infer<typeof commandeSchema>;
