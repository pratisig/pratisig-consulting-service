import { z } from 'zod';

export const produitSchema = z.object({
  nom: z.string().min(2).max(200).trim(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  prix: z.number().positive(),
  prixPromo: z.number().positive().optional(),
  stock: z.number().int().min(0),
  categorieId: z.string().cuid(),
});

export const commandeSchema = z.object({
  lignes: z.array(z.object({
    produitId: z.string().cuid(),
    quantite: z.number().int().positive(),
  })).min(1),
  modePaiement: z.enum(['LIVRAISON', 'WAVE', 'ORANGE_MONEY']),
  adresseLivraison: z.string().min(5).max(500),
  villeLivraison: z.string().min(2).max(100),
  telephoneClient: z.string().regex(/^(\+221|00221)?[7][0-9]{8}$/),
  notesClient: z.string().max(500).optional(),
});

export type ProduitInput = z.infer<typeof produitSchema>;
export type CommandeInput = z.infer<typeof commandeSchema>;
