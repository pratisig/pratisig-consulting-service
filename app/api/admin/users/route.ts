import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { canManageRole } from '@/lib/auth/permissions';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (!['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role') as Role | null;
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  
  // Non-admin users can't see SUPER_ADMIN
  if (currentUser.role === 'ADMIN') {
    where.role = { notIn: ['SUPER_ADMIN'] };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }
  if (role) where.role = role;
  if (status) where.status = status;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
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
        permissions: { select: { permission: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({
    users: users.map(u => ({
      ...u,
      extraPermissions: u.permissions.map(p => p.permission),
      permissions: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: 'Non authentifié' }, { status: 401 });
  if (currentUser.role !== 'SUPER_ADMIN') {
    return Response.json({ error: 'Seul le Super Admin peut créer des utilisateurs' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, phone, password, role, status } = body;

    // Validation
    if (!name || !email) {
      return Response.json({ error: 'Nom et email requis' }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'Un utilisateur avec cet email existe déjà' }, { status: 400 });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password || 'password123', 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: role || 'CLIENT',
        status: status || 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return Response.json(user, { status: 201 });
  } catch (error: any) {
    console.error('Erreur création utilisateur:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
