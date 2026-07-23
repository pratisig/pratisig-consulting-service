import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { Role } from '@prisma/client';

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('pratisig_session');

  if (!session) return null;

  try {
    const data = JSON.parse(session.value);
    if (!data.userId) return null;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') return null;
    return user;
  } catch {
    return null;
  }
}

export function parseSessionCookie(value: string): SessionUser | null {
  try {
    const data = JSON.parse(value);
    return {
      id: data.userId,
      email: data.email,
      name: data.name,
      role: data.role,
    };
  } catch {
    return null;
  }
}
