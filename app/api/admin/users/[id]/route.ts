import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { canManageRole, isRoleHigherOrEqual } from '@/lib/auth/permissions';
import { Role, UserStatus, Permission, AuditAction } from '@prisma/client';
import { logAudit } from '@/lib/security/audit';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

const updatePermissionsSchema = z.object({
  permissions: z.array(z.nativeEnum(Permission)),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      image: true,
      lastLogin: true,
      createdAt: true,
      permissions: { select: { permission: true, grantedAt: true } },
    },
  });

  if (!user) return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  return Response.json(user);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  // Check target user exists
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

  // Check if current user can manage this user's role
  if (body.role !== undefined) {
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Rôle invalide' }, { status: 400 });

    if (!canManageRole(currentUser.role as Role, parsed.data.role)) {
      return Response.json({ error: 'Vous ne pouvez pas attribuer ce rôle' }, { status: 403 });
    }
    if (!canManageRole(currentUser.role as Role, targetUser.role)) {
      return Response.json({ error: 'Vous ne pouvez pas modifier cet utilisateur' }, { status: 403 });
    }

    // Prevent self-role-demotion of SUPER_ADMIN
    if (id === currentUser.id && parsed.data.role !== 'SUPER_ADMIN') {
      return Response.json({ error: 'Vous ne pouvez pas rétrograder votre propre compte' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
    });

    await logAudit({
      userId: currentUser.id,
      action: 'USER_ROLE_CHANGE' as AuditAction,
      entity: 'User',
      entityId: id,
      metadata: { oldRole: targetUser.role, newRole: parsed.data.role },
      ip,
    });
  }

  // Update status
  if (body.status !== undefined) {
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Statut invalide' }, { status: 400 });

    if (!canManageRole(currentUser.role as Role, targetUser.role)) {
      return Response.json({ error: 'Vous ne pouvez pas modifier cet utilisateur' }, { status: 403 });
    }
    if (id === currentUser.id) {
      return Response.json({ error: 'Vous ne pouvez pas modifier votre propre statut' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await logAudit({
      userId: currentUser.id,
      action: parsed.data.status === 'BANNED' ? 'USER_BAN' as AuditAction : 'USER_UPDATE' as AuditAction,
      entity: 'User',
      entityId: id,
      metadata: { oldStatus: targetUser.status, newStatus: parsed.data.status },
      ip,
    });
  }

  // Update permissions
  if (body.permissions !== undefined) {
    const parsed = updatePermissionsSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: 'Permissions invalides' }, { status: 400 });

    if (!canManageRole(currentUser.role as Role, targetUser.role)) {
      return Response.json({ error: 'Vous ne pouvez pas modifier les permissions de cet utilisateur' }, { status: 403 });
    }

    // Remove old extra permissions, add new ones
    await prisma.userPermission.deleteMany({ where: { userId: id } });
    
    if (parsed.data.permissions.length > 0) {
      await prisma.userPermission.createMany({
        data: parsed.data.permissions.map(permission => ({
          userId: id,
          permission,
          grantedBy: currentUser.id,
        })),
      });
    }

    await logAudit({
      userId: currentUser.id,
      action: 'PERMISSION_CHANGE' as AuditAction,
      entity: 'User',
      entityId: id,
      metadata: { permissions: parsed.data.permissions },
      ip,
    });
  }

  const updated = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      permissions: { select: { permission: true } },
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (currentUser.role !== 'SUPER_ADMIN') {
    return Response.json({ error: 'Seul le Super Admin peut supprimer des utilisateurs' }, { status: 403 });
  }

  const { id } = await params;

  if (id === currentUser.id) {
    return Response.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 });

  await prisma.user.delete({ where: { id } });

  await logAudit({
    userId: currentUser.id,
    action: 'USER_DELETE',
    entity: 'User',
    entityId: id,
    metadata: { deletedEmail: targetUser.email, deletedRole: targetUser.role },
    ip: req.headers.get('x-forwarded-for') || 'unknown',
  });

  return Response.json({ success: true });
}
