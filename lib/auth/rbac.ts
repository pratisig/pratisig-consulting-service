import { Role } from '@prisma/client';

// Hiérarchie des droits par module
export const PERMISSIONS = {
  // Immobilier
  'immobilier:view': [Role.PUBLIC, Role.CLIENT, Role.PROPRIETAIRE, Role.GERANT, Role.ADMIN, Role.SUPER_ADMIN],
  'immobilier:create': [Role.PROPRIETAIRE, Role.GERANT, Role.ADMIN, Role.SUPER_ADMIN],
  'immobilier:manage': [Role.GERANT, Role.ADMIN, Role.SUPER_ADMIN],
  'immobilier:publish': [Role.GERANT, Role.ADMIN, Role.SUPER_ADMIN],

  // Transfert d'argent
  'transfert:operate': [Role.AGENT, Role.SUPERVISEUR, Role.ADMIN, Role.SUPER_ADMIN],
  'transfert:supervise': [Role.SUPERVISEUR, Role.ADMIN, Role.SUPER_ADMIN],
  'transfert:reports': [Role.SUPERVISEUR, Role.ADMIN, Role.SUPER_ADMIN],

  // Alimentation
  'alimentation:sell': [Role.CAISSIER, Role.GERANT, Role.SUPERVISEUR, Role.ADMIN, Role.SUPER_ADMIN],
  'alimentation:manage': [Role.GERANT, Role.SUPERVISEUR, Role.ADMIN, Role.SUPER_ADMIN],
  'alimentation:reports': [Role.SUPERVISEUR, Role.ADMIN, Role.SUPER_ADMIN],

  // E-commerce
  'ecommerce:view': [Role.PUBLIC, Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN],
  'ecommerce:buy': [Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN],
  'ecommerce:manage': [Role.ADMIN, Role.SUPER_ADMIN],

  // Livraison
  'livraison:request': [Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN],
  'livraison:deliver': [Role.LIVREUR, Role.ADMIN, Role.SUPER_ADMIN],
  'livraison:manage': [Role.SUPERVISEUR, Role.ADMIN, Role.SUPER_ADMIN],

  // Admin général
  'admin:access': [Role.ADMIN, Role.SUPER_ADMIN],
  'admin:users': [Role.ADMIN, Role.SUPER_ADMIN],
  'admin:full': [Role.SUPER_ADMIN],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: Role, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission] as readonly Role[];
  return allowed.includes(userRole);
}

export function requirePermission(userRole: Role | undefined, permission: Permission): void {
  if (!userRole || !hasPermission(userRole, permission)) {
    throw new Error(`Accès refusé : permission '${permission}' requise.`);
  }
}
