import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { logAudit } from '@/lib/security/audit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Email ou mot de passe invalide' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
        image: true,
        permissions: { select: { permission: true } },
      },
    });

    if (!user || !user.password) {
      return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    if (user.status === 'BANNED') {
      return Response.json({ error: 'Votre compte a été banni. Contactez un administrateur.' }, { status: 403 });
    }

    if (user.status === 'SUSPENDED') {
      return Response.json({ error: 'Votre compte est suspendu. Contactez un administrateur.' }, { status: 403 });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch(e => console.warn('Failed to update lastLogin:', e));

    // Set session cookie
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const cookieStore = await cookies();
    cookieStore.set('pratisig_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Log audit (non-blocking)
    try {
      await logAudit({
        userId: user.id,
        action: 'USER_CREATE',
        entity: 'Session',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      });
    } catch (e) {
      console.warn('Audit log skipped (non-fatal):', e);
    }

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        image: user.image,
        permissions: user.permissions.map(p => p.permission),
      },
    });
  } catch (error: any) {
    console.error('Login error:', error?.message || error);
    return Response.json(
      { error: error?.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
