import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide').toLowerCase().trim(),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nom minimum 2 caractères').max(100).trim(),
  email: z.string().email('Email invalide').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins 1 caractère spécial'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
