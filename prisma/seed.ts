import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { seedBeneficiaries } from './seed-beneficiaries'
import { seedHomeBeneficiaries } from './seed-home-beneficiaries';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ramadan.com' },
    update: {},
    create: {
      email: 'admin@ramadan.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create distributor user
  const distributorPassword = await bcrypt.hash('distributor123', 10);

  const distributor = await prisma.user.upsert({
    where: { email: 'distributor@ramadan.com' },
    update: {},
    create: {
      email: 'distributor@ramadan.com',
      password: distributorPassword,
      fullName: 'Distribution Staff',
      role: 'DISTRIBUTOR',
      isActive: true,
    },
  });

  console.log('✅ Distributor user created:', distributor.email);

  // Create accountant user
  const accountantPassword = await bcrypt.hash('accountant123', 10);

  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@ramadan.com' },
    update: {},
    create: {
      email: 'accountant@ramadan.com',
      password: accountantPassword,
      fullName: 'Finance Manager',
      role: 'ACCOUNTANT',
      isActive: true,
    },
  });
const locationsData = [
    { name: 'شرقي', description: 'منطقة شرقي' },
    { name: 'قبلي', description: 'منطقة قبلي' },
    { name: 'بحري', description: 'منطقة بحري' },
    { name: 'وسط', description: 'منطقة وسط البلد' },
  ];

  const locations = [];

  for (const loc of locationsData) {
    const created = await prisma.location.create({
      data: loc,
    });
    locations.push(created);
  }

  await seedBeneficiaries()
  await seedHomeBeneficiaries()
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });