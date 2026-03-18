import { z } from 'zod';

export const livraisonSchema = z.object({
  adresseCollecte: z.string().min(5).max(300),
  adresseDest: z.string().min(5).max(300),
  latCollecte: z.number().optional(),
  lngCollecte: z.number().optional(),
  latDest: z.number().optional(),
  lngDest: z.number().optional(),
  description: z.string().max(300).optional(),
  zoneId: z.string().optional(),
});

export type LivraisonInput = z.infer<typeof livraisonSchema>;
