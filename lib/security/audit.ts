import { prisma } from '@/lib/db/prisma';
import { headers } from 'next/headers';

interface AuditLogParams {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ??
                headersList.get('x-real-ip') ?? 'unknown';
    const userAgent = headersList.get('user-agent') ?? 'unknown';

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata as any,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('[AuditLog Error]', error);
  }
}
