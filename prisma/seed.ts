import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@pratisig.sn' },
    update: {},
    create: {
      name: 'Super Admin Pratisig',
      email: 'admin@pratisig.sn',
      password: await bcrypt.hash('Pratisig@2026!', 12),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Super Admin:', superAdmin.email);

  // Agent test
  const agent = await prisma.user.upsert({
    where: { email: 'agent@pratisig.sn' },
    update: {},
    create: {
      name: 'Agent Test',
      email: 'agent@pratisig.sn',
      password: await bcrypt.hash('Agent@2026!', 12),
      role: 'AGENT',
      status: 'ACTIVE',
      phone: '+221770000001',
    },
  });
  console.log('✅ Agent:', agent.email);

  // Catégories alimentation
  const cats = ['Boissons', 'Céréales & farines', 'Conserves', 'Huiles & matières grasses', 'Produits frais', 'Condiments & épices'];
  for (const nom of cats) {
    await prisma.categorieAlimentation.upsert({
      where: { id: nom },
      update: {},
      create: { id: nom, nom },
    });
  }
  console.log('✅ Catégories alimentation');

  // Catégories e-commerce
  const ecats = [
    { nom: 'Mode & Vêtements', slug: 'mode' },
    { nom: 'Électronique', slug: 'electronique' },
    { nom: 'Maison & Déco', slug: 'maison' },
    { nom: 'Alimentation', slug: 'alimentation' },
    { nom: 'Beaute & Bien-être', slug: 'beaute' },
  ];
  for (const cat of ecats) {
    await prisma.categorieEcommerce.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Catégories e-commerce');

  // Zones de livraison Dakar
  const zones = [
    { nom: 'Zone 1 - Centre Dakar', description: 'Plateau, Médina', prix: 1500 },
    { nom: 'Zone 2 - Dakar Nord', description: 'Ouakam, Almadies, Ngor', prix: 2000 },
    { nom: 'Zone 3 - Dakar Est', description: 'Pikine, Guédiawaye', prix: 2500 },
    { nom: 'Zone 4 - Banlieue', description: 'Rufisque, Bargny', prix: 3500 },
  ];
  for (const zone of zones) {
    await prisma.zoneLivraison.upsert({
      where: { id: zone.nom },
      update: {},
      create: { id: zone.nom, ...zone },
    });
  }
  console.log('✅ Zones de livraison');

  console.log('\n🎉 Seed terminé !');
  console.log('   Admin: admin@pratisig.sn / Pratisig@2026!');
  console.log('   Agent: agent@pratisig.sn / Agent@2026!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
