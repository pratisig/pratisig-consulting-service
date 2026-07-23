import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('pratisig_session');

  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('pratisig_session');

  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const data = JSON.parse(session.value);
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ user: null });
  }
}
