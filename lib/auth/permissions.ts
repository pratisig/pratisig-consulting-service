import { Role, Permission } from '@prisma/client';

// ─── ROLE HIERARCHY ──────────────────────────────────────────────────────────
// Higher index = more powerful
export const ROLE_HIERARCHY: Role[] = [
  'CLIENT',
  'PROPRIETAIRE',
  'LIVREUR',
  'CAISSIER',
  'AGENT',
  'MANAGER_ALIMENTATION',
  'MANAGER_TRANSFERT',
  'MANAGER_LIVRAISON',
  'MANAGER_ECOMMERCE',
  'MANAGER_IMMOBILIER',
  'ADMIN',
  'SUPER_ADMIN',
];

// ─── DEFAULT PERMISSIONS PER ROLE ────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: Object.values(Permission), // Everything

  ADMIN: [
    'immobilier_view', 'immobilier_create', 'immobilier_edit', 'immobilier_delete', 'immobilier_publish',
    'ecommerce_view', 'ecommerce_create', 'ecommerce_edit', 'ecommerce_delete',
    'livraison_view', 'livraison_create', 'livraison_edit', 'livraison_delete', 'livraison_assign',
    'transfert_view', 'transfert_create', 'transfert_validate',
    'caisse_view', 'caisse_validate',
    'users_view', 'users_edit',
    'reports_view', 'reports_export',
    'notifications_manage',
  ],

  MANAGER_IMMOBILIER: [
    'immobilier_view', 'immobilier_create', 'immobilier_edit', 'immobilier_publish',
    'reports_view',
  ],

  MANAGER_ECOMMERCE: [
    'ecommerce_view', 'ecommerce_create', 'ecommerce_edit',
    'reports_view',
  ],

  MANAGER_LIVRAISON: [
    'livraison_view', 'livraison_create', 'livraison_edit', 'livraison_assign',
    'reports_view',
  ],

  MANAGER_TRANSFERT: [
    'transfert_view', 'transfert_create', 'transfert_validate',
    'reports_view',
  ],

  MANAGER_ALIMENTATION: [
    'caisse_view', 'caisse_create', 'caisse_validate', 'caisse_close',
    'reports_view',
  ],

  AGENT: [
    'transfert_view', 'transfert_create',
  ],

  CAISSIER: [
    'caisse_view', 'caisse_create',
  ],

  LIVREUR: [
    'livraison_view',
  ],

  PROPRIETAIRE: [
    'immobilier_view', 'immobilier_create', 'immobilier_edit',
  ],

  CLIENT: [
    'ecommerce_view',
    'livraison_view',
    'immobilier_view',
  ],
};

// ─── PERMISSION LABELS (for UI) ──────────────────────────────────────────────
export const PERMISSION_LABELS: Record<Permission, string> = {
  immobilier_view: 'Voir les biens',
  immobilier_create: 'Créer des biens',
  immobilier_edit: 'Modifier des biens',
  immobilier_delete: 'Supprimer des biens',
  immobilier_publish: 'Publier des biens',
  ecommerce_view: 'Voir la boutique',
  ecommerce_create: 'Créer des produits',
  ecommerce_edit: 'Modifier des produits',
  ecommerce_delete: 'Supprimer des produits',
  livraison_view: 'Voir les livraisons',
  livraison_create: 'Créer des livraisons',
  livraison_edit: 'Modifier les livraisons',
  livraison_delete: 'Supprimer des livraisons',
  livraison_assign: 'Assigner des livreurs',
  transfert_view: 'Voir les transferts',
  transfert_create: 'Créer des transferts',
  transfert_validate: 'Valider des transferts',
  transfert_delete: 'Supprimer des transferts',
  caisse_view: 'Voir la caisse',
  caisse_create: 'Opérations de caisse',
  caisse_validate: 'Valider les opérations',
  caisse_delete: 'Supprimer des opérations',
  caisse_close: 'Clôturer la caisse',
  users_view: 'Voir les utilisateurs',
  users_create: 'Créer des utilisateurs',
  users_edit: 'Modifier les utilisateurs',
  users_delete: 'Supprimer des utilisateurs',
  users_assign_role: 'Attribuer des rôles',
  reports_view: 'Voir les rapports',
  reports_export: 'Exporter les rapports',
  platform_settings: 'Paramètres plateforme',
  platform_audit: 'Voir les logs d\'audit',
  notifications_manage: 'Gérer les notifications',
};

// ─── ROLE LABELS ─────────────────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  ADMIN: 'Administrateur',
  MANAGER_IMMOBILIER: 'Manager Immobilier',
  MANAGER_ECOMMERCE: 'Manager E-commerce',
  MANAGER_LIVRAISON: 'Manager Livraison',
  MANAGER_TRANSFERT: 'Manager Transfert',
  MANAGER_ALIMENTATION: 'Manager Alimentation',
  AGENT: 'Agent',
  CAISSIER: 'Caissier',
  LIVREUR: 'Livreur',
  PROPRIETAIRE: 'Propriétaire',
  CLIENT: 'Client',
};

// ─── CHECK FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Check if a role has a specific permission (including default role permissions)
 */
export function hasPermission(role: Role, permission: Permission, extraPermissions?: Permission[]): boolean {
  const allPerms = [...ROLE_PERMISSIONS[role], ...(extraPermissions || [])];
  return allPerms.includes(permission);
}

/**
 * Check if role1 is higher or equal in hierarchy to role2
 */
export function isRoleHigherOrEqual(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY.indexOf(role1) >= ROLE_HIERARCHY.indexOf(role2);
}

/**
 * Check if a role can manage (assign/edit) another role
 */
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  if (managerRole === 'SUPER_ADMIN') return true;
  if (managerRole === 'ADMIN') {
    return !['SUPER_ADMIN', 'ADMIN'].includes(targetRole);
  }
  return false;
}

/**
 * Check if a role can delete an entity managed by another role
 */
export function canDeleteEntity(actorRole: Role, entityOwnerRole: Role): boolean {
  if (actorRole === 'SUPER_ADMIN') return true;
  if (actorRole === 'ADMIN') {
    return !['SUPER_ADMIN'].includes(entityOwnerRole);
  }
  return false;
}

/**
 * Get all permissions for a user (role defaults + extra granted permissions)
 */
export function getUserPermissions(role: Role, extraPermissions: Permission[]): Permission[] {
  const defaults = ROLE_PERMISSIONS[role];
  const all = new Set([...defaults, ...extraPermissions]);
  return Array.from(all);
}
