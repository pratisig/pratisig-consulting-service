import { z } from 'zod';

export const livraisonSchema = z.object({
  adresseCollecte: z.string().min(5).max(500),
  latCollecte: z.number().min(-90).max(90).optional(),
  lngCollecte: z.number().min(-180).max(180).optional(),
  adresseDest: z.string().min(5).max(500),
  latDest: z.number().min(-90).max(90).optional(),
  lngDest: z.number().min(-180).max(180).optional(),
  description: z.string().max(500).optional(),
  zoneId: z.string().cuid().optional(),
});

export type LivraisonInput = z.infer<typeof livraisonSchema>;
