import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logAudit } from '@/lib/security/audit';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(8).max(20).optional(),
  role: z.enum(['CLIENT', 'PROPRIETAIRE']).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      return Response.json(
        { error: 'Un compte avec cet email ou téléphone existe déjà' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Prisma
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: parsed.data.role || 'CLIENT',
        status: parsed.data.role === 'PROPRIETAIRE' ? 'PENDING' : 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
      },
    });

    // Try to create Supabase auth user (optional, non-blocking)
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, prisma_id: user.id },
        });
        if (error) console.warn('Supabase auth user creation warning:', error.message);
      }
    } catch (e) {
      console.warn('Supabase auth setup skipped (non-fatal):', e);
    }

    // Log audit
    try {
      await logAudit({
        userId: user.id,
        action: 'USER_CREATE',
        entity: 'User',
        entityId: user.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      });
    } catch (e) {
      console.warn('Audit log skipped (non-fatal):', e);
    }

    // Set session cookie
    const { cookies } = await import('next/headers');
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
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    const message = parsed.data.role === 'PROPRIETAIRE'
      ? 'Compte créé ! Votre compte propriétaire sera vérifié par un administrateur avant de pouvoir publier des biens.'
      : 'Compte créé avec succès';

    return Response.json({ user, message }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error?.message || error);
    return Response.json(
      { error: error?.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
