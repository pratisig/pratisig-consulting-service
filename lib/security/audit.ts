import { prisma } from '@/lib/db/prisma';

interface AuditInput {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ip?: string;
}

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({ data: input });
  } catch (err) {
    // Ne jamais bloquer l'opération principale pour un log
    console.error('[AuditLog] Erreur:', err);
  }
}
