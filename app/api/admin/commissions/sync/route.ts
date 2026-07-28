import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { syncMissingCommissions } from '@/lib/utils/commissions';

export async function POST() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const result = await syncMissingCommissions();

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Sync terminé: ${(result as any).ventes} ventes, ${(result as any).locations} locations créées`,
      details: result,
    });
  }

  return NextResponse.json({
    success: false,
    error: (result as any).error || 'Erreur lors de la synchronisation',
  }, { status: 500 });
}
