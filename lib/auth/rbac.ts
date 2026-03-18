type Permission =
  | 'transfert:operate' | 'transfert:supervise' | 'transfert:reports'
  | 'alimentation:sell' | 'alimentation:manage'
  | 'ecommerce:manage' | 'ecommerce:order'
  | 'livraison:request' | 'livraison:deliver' | 'livraison:supervise'
  | 'immobilier:publish' | 'immobilier:manage'
  | 'admin:access' | 'admin:users';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'transfert:operate','transfert:supervise','transfert:reports',
    'alimentation:sell','alimentation:manage',
    'ecommerce:manage','ecommerce:order',
    'livraison:request','livraison:deliver','livraison:supervise',
    'immobilier:publish','immobilier:manage',
    'admin:access','admin:users',
  ],
  ADMIN: [
    'transfert:supervise','transfert:reports',
    'alimentation:sell','alimentation:manage',
    'ecommerce:manage','ecommerce:order',
    'livraison:request','livraison:supervise',
    'immobilier:publish','immobilier:manage',
    'admin:access','admin:users',
  ],
  SUPERVISEUR: [
    'transfert:operate','transfert:supervise','transfert:reports',
    'alimentation:sell','alimentation:manage',
    'livraison:request','livraison:supervise',
    'immobilier:manage',
  ],
  AGENT: ['transfert:operate'],
  GERANT: ['alimentation:sell','alimentation:manage','immobilier:publish','immobilier:manage'],
  CAISSIER: ['alimentation:sell'],
  PROPRIETAIRE: ['immobilier:publish'],
  LIVREUR: ['livraison:deliver'],
  CLIENT: ['ecommerce:order','livraison:request'],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getUserPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
