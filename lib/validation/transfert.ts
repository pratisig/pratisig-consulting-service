import { z } from 'zod';

export const transactionSchema = z.object({
  service: z.enum(['WAVE','ORANGE_MONEY','YASH_MONEY','KAPEY','FREE_MONEY','EMONEY']),
  type: z.enum(['DEPOT','RETRAIT','TRANSFERT','PAIEMENT_FACTURE','RECHARGE']),
  montant: z.number().positive('Le montant doit être positif').max(5_000_000, 'Montant max 5 000 000 FCFA'),
  clientPhone: z.string().min(8, 'Téléphone invalide').max(20),
  clientNom: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
