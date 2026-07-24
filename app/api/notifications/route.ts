import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const notifications = await prisma.$queryRaw`
      SELECT * FROM "Notification" 
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
      LIMIT 50
    `;

    const unreadCount = await prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM "Notification" 
      WHERE "userId" = ${user.id} AND lu = false
    `;

    return NextResponse.json({
      notifications,
      unreadCount: (unreadCount as any[])[0]?.count || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { notificationId } = body;

    // Marquer une notification comme lue
    if (notificationId) {
      await prisma.$executeRaw`
        UPDATE "Notification" SET lu = true WHERE id = ${notificationId} AND "userId" = ${user.id}
      `;
      return NextResponse.json({ success: true });
    }

    // Marquer toutes les notifications comme lues
    await prisma.$executeRaw`
      UPDATE "Notification" SET lu = true WHERE "userId" = ${user.id} AND lu = false
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Créer une notification (usage interne)
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, titre, message, type, lien } = body;

    await prisma.$executeRaw`
      INSERT INTO "Notification" ("userId", titre, message, type, lien)
      VALUES (${userId}, ${titre}, ${message}, ${type || 'INFO'}, ${lien || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
