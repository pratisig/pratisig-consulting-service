import { z } from 'zod';

export const bienImmobilierSchema = z.object({
  titre: z.string().min(5).max(200).trim(),
  description: z.string().min(20).max(5000).trim(),
  type: z.enum(['APPARTEMENT', 'MAISON', 'VILLA', 'TERRAIN', 'BUREAU', 'COMMERCE', 'ENTREPOT']),
  transactionType: z.enum(['LOCATION', 'VENTE', 'GERANCE']),
  prix: z.number().positive(),
  surface: z.number().positive().optional(),
  nbChambres: z.number().int().min(0).optional(),
  adresse: z.string().min(5).max(500),
  ville: z.string().min(2).max(100),
  quartier: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type BienImmobilierInput = z.infer<typeof bienImmobilierSchema>;
