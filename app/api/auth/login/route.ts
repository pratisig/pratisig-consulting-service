import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logAudit } from '@/lib/security/audit';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

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

    // Try Supabase auth first (preferred)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        // Get user from our DB
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            image: true,
            permissions: { select: { permission: true } },
          },
        });

        if (user && user.status !== 'ACTIVE') {
          return Response.json({ error: 'Compte désactivé. Contactez un administrateur.' }, { status: 403 });
        }

        if (user) {
          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          // Set session cookie
          const cookieStore = await cookies();
          cookieStore.set('pratisig_session', JSON.stringify({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });

          await logAudit({
            userId: user.id,
            action: 'USER_CREATE', // login
            entity: 'Session',
            ip: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
          });

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
            supabaseSession: data.session,
          });
        }
      }
    }

    // Fallback: local auth with Prisma + bcrypt
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
      return Response.json({ error: 'Votre compte a été banni' }, { status: 403 });
    }

    if (user.status === 'SUSPENDED') {
      return Response.json({ error: 'Votre compte est suspendu' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

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

    await logAudit({
      userId: user.id,
      action: 'USER_CREATE',
      entity: 'Session',
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

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
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
