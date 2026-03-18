import { z } from 'zod';

export const transactionSchema = z.object({
  service: z.enum(['WAVE', 'ORANGE_MONEY', 'YASH_MONEY', 'KAPEY', 'FREE_MONEY', 'EMONEY']),
  type: z.enum(['DEPOT', 'RETRAIT', 'TRANSFERT', 'PAIEMENT_FACTURE', 'RECHARGE']),
  montant: z.number().positive().max(5_000_000, 'Montant max dépassé'),
  clientPhone: z
    .string()
    .regex(/^(\+221|00221)?[7][0-9]{8}$/, 'Numéro sénégalais invalide'),
  clientNom: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
