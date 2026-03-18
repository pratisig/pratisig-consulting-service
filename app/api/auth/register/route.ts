import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { registerSchema } from '@/lib/validation/auth';
import { rateLimit } from '@/lib/security/rate-limit';
import { logAudit } from '@/lib/security/audit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting : max 5 inscriptions par IP par heure
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
    if (!rateLimit(`register:${ip}`, 5, 3_600_000)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, password, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, status: 'ACTIVE', role: 'CLIENT' },
    });

    await logAudit({ userId: user.id, action: 'USER_REGISTER', entity: 'User', entityId: user.id });

    return NextResponse.json({ message: 'Compte créé avec succès.' }, { status: 201 });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
