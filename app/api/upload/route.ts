import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { hasPermission } from '@/lib/auth/rbac';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif'];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = session.user as any;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) ?? 'pratisig';

  if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'Fichier trop grand (max 5MB)' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Type non autorisé' }, { status: 400 });

  // Upload vers Cloudinary
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);
  uploadFormData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET ?? 'pratisig_unsigned');
  uploadFormData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: uploadFormData }
  );

  if (!res.ok) return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  const data = await res.json();

  return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
}
