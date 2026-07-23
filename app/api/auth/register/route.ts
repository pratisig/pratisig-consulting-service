import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logAudit } from '@/lib/security/audit';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().min(8).max(20).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, password, phone } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      return Response.json({ error: 'Un compte avec cet email ou téléphone existe déjà' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'CLIENT',
        status: 'ACTIVE', // Auto-activate; use PENDING + email verification for production
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

    // Create Supabase auth user if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name, prisma_id: user.id },
        });
      } catch (e) {
        console.warn('Supabase user creation failed (non-fatal):', e);
      }
    }

    await logAudit({
      userId: user.id,
      action: 'USER_CREATE',
      entity: 'User',
      entityId: user.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    return Response.json({ user, message: 'Compte créé avec succès' }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
