require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo order + invoice...');

  const hashedPass = await bcrypt.hash('Test@1234', 12);

  // ── Ensure customer account exists ──────────────────────────────────────
  const customer = await prisma.user.upsert({
    where: { email: 'customer@techdrill.com' },
    update: {},
    create: {
      name: 'John Customer',
      email: 'customer@techdrill.com',
      password: hashedPass,
      role: 'CUSTOMER',
      isEmailVerified: true,
    }
  });
  console.log('  ✔ Customer:', customer.email);

  // ── Ensure a delivery address exists ────────────────────────────────────
  let address = await prisma.address.findFirst({ where: { userId: customer.id } });
  if (!address) {
    address = await prisma.address.create({
      data: {
        userId:  customer.id,
        label:   'Home',
        line1:   '42 MG Road',
        line2:   'Near City Mall',
        city:    'Pune',
        state:   'Maharashtra',
        pincode: '411001',
        phone:   '9876543210',
        isDefault: true,
      }
    });
    console.log('  ✔ Address created');
  }

  // ── Pick 2 products to include in the demo order ─────────────────────────
  const products = await prisma.product.findMany({ take: 2, where: { isActive: true }, include: { images: { take: 1 } } });
  if (products.length === 0) {
    console.log('  ⚠ No products found — run the main seed first');
    return;
  }

  const subtotal = products.reduce((s, p) => s + Number(p.price), 0);
  const tax = subtotal * 0.18;
  const shippingCharge = 0; // free — above threshold
  const total = subtotal + tax + shippingCharge;

  // ── Check if a demo delivered order already exists ───────────────────────
  const existing = await prisma.order.findFirst({
    where: { userId: customer.id, status: 'DELIVERED' }
  });

  if (existing) {
    console.log('  ℹ Demo delivered order already exists:', existing.id);
  } else {
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        addressId: address.id,
        subtotal,
        tax,
        shippingCharge,
        total,
        status: 'DELIVERED',
        notes: 'Demo order — seeded for testing',
        items: {
          create: products.map(p => ({
            productId: p.id,
            name:      p.name,
            price:     p.price,
            quantity:  1,
            total:     p.price,
            image:     p.images?.[0]?.url || null,
          }))
        },
        statusHistory: {
          create: [
            { status: 'PLACED',     note: 'Order placed and payment verified', createdAt: new Date(Date.now() - 7*24*60*60*1000) },
            { status: 'ACCEPTED',   note: 'Retailer accepted the order',       createdAt: new Date(Date.now() - 6*24*60*60*1000) },
            { status: 'PROCESSED',  note: 'Order packed and ready to ship',    createdAt: new Date(Date.now() - 5*24*60*60*1000) },
            { status: 'DISPATCHED', note: 'Shipped via BlueDart | Track: BD123456789', createdAt: new Date(Date.now() - 3*24*60*60*1000) },
            { status: 'DELIVERED',  note: 'Delivered to customer — signed by John', createdAt: new Date(Date.now() - 1*24*60*60*1000) },
          ]
        }
      },
      include: { items: true }
    });
    console.log('  ✔ Delivered order created:', order.id);

    // ── Attach a verified payment record ─────────────────────────────────
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId:   `order_DEMO${Date.now().toString(36).toUpperCase()}`,
        razorpayPaymentId: `pay_DEMO${Date.now().toString(36).toUpperCase()}`,
        razorpaySignature: 'demo_signature_verified',
        amount: total,
        currency: 'INR',
        status: 'SUCCESS',
        method: 'UPI',
      }
    });
    console.log('  ✔ Payment record (SUCCESS) attached');
  }

  console.log('\n✅ Demo seed complete!');
  console.log('   Login: customer@techdrill.com / Test@1234');
  console.log('   Visit: http://localhost:5173/orders');
}

main()
  .catch(e => { console.error('❌ Demo seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
