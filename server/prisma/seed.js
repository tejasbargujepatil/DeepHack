require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Categories ────────────────────────────────────────────────
  const catData = [
    { name: 'Laptops', slug: 'laptops', description: 'High performance laptops and notebooks' },
    { name: 'Smartphones', slug: 'smartphones', description: 'Latest flagship and budget phones' },
    { name: 'Accessories', slug: 'accessories', description: 'Cables, cases, chargers and more' },
    { name: 'Audio', slug: 'audio', description: 'Headphones, earbuds and speakers' },
    { name: 'Gaming', slug: 'gaming', description: 'Gaming peripherals and consoles' },
  ];

  const categories = {};
  for (const cat of catData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = c;
    console.log(`  ✔ Category: ${c.name}`);
  }

  // ─── Users ─────────────────────────────────────────────────────
  const hashedPass = await bcrypt.hash('Test@1234', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@techdrill.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@techdrill.com',
      password: hashedPass,
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
  });
  console.log(`  ✔ Super Admin: ${superAdmin.email}`);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@techdrill.com' },
    update: {},
    create: {
      name: 'John Customer',
      email: 'customer@techdrill.com',
      password: hashedPass,
      role: 'CUSTOMER',
      isEmailVerified: true,
    },
  });
  console.log(`  ✔ Customer: ${customer.email}`);

  // ─── Products ──────────────────────────────────────────────────
  const products = [
    {
      name: 'Apple MacBook Air M2',
      slug: 'apple-macbook-air-m2',
      description: 'Supercharged by the M2 chip, the redesigned MacBook Air is incredibly fast and capable, and so thin and light that you can take it anywhere.',
      price: 114900,
      comparePrice: 129900,
      discount: 11.55,
      stock: 25,
      sku: 'APPL-MBA-M2-256',
      brand: 'Apple',
      categoryId: categories['laptops'].id,
      specs: { Chip: 'Apple M2', RAM: '8GB Unified Memory', Storage: '256GB SSD', Display: '13.6-inch Liquid Retina', Battery: 'Up to 18 hours' },
      tags: ['apple', 'laptop', 'macbook', 'm2'],
      isFeatured: true,
      rating: 4.8,
      reviewCount: 1284,
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Galaxy AI is here. Designed for the Galaxy S24 Ultra, Galaxy AI features bring new ways to communicate, create, and more.',
      price: 134999,
      comparePrice: 144999,
      discount: 6.9,
      stock: 42,
      sku: 'SAM-S24U-256',
      brand: 'Samsung',
      categoryId: categories['smartphones'].id,
      specs: { Display: '6.8-inch QHD+ Dynamic AMOLED', Processor: 'Snapdragon 8 Gen 3', RAM: '12GB', Storage: '256GB', Camera: '200MP Main' },
      tags: ['samsung', 'android', 'flagship'],
      isFeatured: true,
      rating: 4.6,
      reviewCount: 893,
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      slug: 'sony-wh1000xm5',
      description: 'Industry-leading noise cancellation with eight microphones. Up to 30-hour battery with quick charging.',
      price: 26990,
      comparePrice: 34990,
      discount: 22.86,
      stock: 60,
      sku: 'SNY-WH1000XM5-BLK',
      brand: 'Sony',
      categoryId: categories['audio'].id,
      specs: { 'Driver Size': '30mm', 'Battery Life': '30 hours', 'ANC': 'Yes – Industry Leading', Connectivity: 'Bluetooth 5.2' },
      tags: ['sony', 'headphones', 'noise-cancelling'],
      isFeatured: true,
      rating: 4.7,
      reviewCount: 2341,
    },
    {
      name: 'Dell XPS 15 (2024)',
      slug: 'dell-xps-15-2024',
      description: 'The Dell XPS 15 is the perfect combination of compact performance and breathtaking visuals in a portable 15-inch format.',
      price: 159990,
      stock: 15,
      sku: 'DELL-XPS15-2024-I9',
      brand: 'Dell',
      categoryId: categories['laptops'].id,
      specs: { Processor: 'Intel Core i9-14900H', RAM: '32GB DDR5', Storage: '1TB NVMe SSD', Display: '15.6-inch 3.5K OLED' },
      tags: ['dell', 'laptop', 'xps'],
      rating: 4.5,
      reviewCount: 412,
    },
    {
      name: 'Apple AirPods Pro (2nd Gen)',
      slug: 'apple-airpods-pro-2',
      description: 'The new AirPods Pro feature up to 2x more Active Noise Cancellation and Adaptive Audio.',
      price: 24900,
      comparePrice: 26900,
      discount: 7.43,
      stock: 80,
      sku: 'APPL-APDPRO2',
      brand: 'Apple',
      categoryId: categories['audio'].id,
      specs: { Chip: 'H2', ANC: 'Adaptive Transparency', Battery: '6 hours + 30 hours with case', Connectivity: 'Bluetooth 5.3' },
      tags: ['apple', 'earbuds', 'airpods'],
      isFeatured: true,
      rating: 4.9,
      reviewCount: 5872,
    },
    {
      name: 'Razer DeathAdder V3 Pro',
      slug: 'razer-deathadder-v3-pro',
      description: 'Ultra-lightweight wireless gaming mouse with Focus Pro 30K Optical Sensor.',
      price: 12999,
      stock: 35,
      sku: 'RAZER-DAV3PRO',
      brand: 'Razer',
      categoryId: categories['gaming'].id,
      specs: { Sensor: 'Focus Pro 30K Optical', DPI: 'Up to 30,000', Weight: '64g', Connectivity: 'HyperSpeed Wireless' },
      tags: ['razer', 'mouse', 'gaming'],
      rating: 4.6,
      reviewCount: 867,
    },
    {
      name: 'Anker 67W USB-C Charger',
      slug: 'anker-67w-usbc-charger',
      description: 'Compact 67W USB-C charger with PowerIQ 3.0 — charge your MacBook, iPad or phone fast.',
      price: 2999,
      stock: 150,
      sku: 'ANKR-CHG-67W',
      brand: 'Anker',
      categoryId: categories['accessories'].id,
      specs: { 'Output Power': '67W', Ports: '2x USB-C + 1x USB-A', Standard: 'GaN II', Compatibility: 'Universal' },
      tags: ['charger', 'usb-c', 'anker'],
      rating: 4.5,
      reviewCount: 3201,
    },
    {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'iPhone 15 Pro. Forged in titanium with the A17 Pro chip. An industry-first 3nm chip for pro-level photography.',
      price: 134900,
      stock: 30,
      sku: 'APPL-IP15PRO-256',
      brand: 'Apple',
      categoryId: categories['smartphones'].id,
      specs: { Chip: 'A17 Pro', Display: '6.1-inch Super Retina XDR', Camera: '48MP Fusion', Storage: '256GB' },
      tags: ['apple', 'iphone', 'ios'],
      isFeatured: true,
      rating: 4.7,
      reviewCount: 4521,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
    console.log(`  ✔ Product: ${prod.name}`);
  }

  console.log('\n✅ Seeding complete!\n');
  console.log('🔑 Login credentials:');
  console.log('   Admin  → admin@techdrill.com / Test@1234');
  console.log('   User   → customer@techdrill.com / Test@1234\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
