import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import FicheBien from '@/components/immobilier/FicheBien';

export default async function FicheBienPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bien = await prisma.bienImmobilier.findFirst({
    where: { id, isActive: true },
    include: { proprietaire: { select: { name: true, phone: true, email: true, whatsapp: true } } },
  }).catch(() => null);

  if (!bien) notFound();

  return <FicheBien bien={bien} />;
}
