import { prisma } from '@/lib/db/prisma';
import { AuditAction, Prisma } from '@prisma/client';

interface LogAuditParams {
  userId: string;
  action: AuditAction | string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  metadata,
  ip,
  userAgent,
}: LogAuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: action as AuditAction,
        entity,
        entityId,
        metadata: metadata ? metadata as Prisma.InputJsonValue : undefined,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error);
    // Don't throw - audit failure shouldn't break the main operation
  }
}

export async function getAuditLogs(params: {
  userId?: string;
  action?: AuditAction;
  entity?: string;
  limit?: number;
  offset?: number;
}) {
  const { userId, action, entity, limit = 50, offset = 0 } = params;
  
  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entity) where.entity = entity;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
