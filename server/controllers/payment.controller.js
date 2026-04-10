const getRazorpay  = require('../config/razorpay');
const prisma       = require('../config/db');
const { verifyRazorpaySignature } = require('../utils/helpers');
const { sendSuccess } = require('../utils/response');
const catchAsync   = require('../utils/catchAsync');
const AppError     = require('../utils/AppError');

// ─── Create Razorpay order (order must exist as PENDING_PAYMENT) ────────────
exports.createRazorpayOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return next(new AppError('Order not found', 404));
  if (order.status === 'CANCELLED') return next(new AppError('Cannot pay for a cancelled order', 400));
  if (!['PENDING_PAYMENT', 'PLACED'].includes(order.status)) {
    return next(new AppError('This order is already being processed', 400));
  }

  const existingPayment = await prisma.payment.findUnique({ where: { orderId } });
  if (existingPayment?.status === 'SUCCESS') {
    return next(new AppError('This order has already been paid', 400));
  }

  const amountInPaise = Math.round(Number(order.total) * 100);

  let razorpayOrder;
  try {
    const razorpay = getRazorpay();
    razorpayOrder = await razorpay.orders.create({
      amount:  amountInPaise,
      currency:'INR',
      receipt: `rcpt_${order.id.slice(-12)}`,
    });
  } catch (rzErr) {
    const msg = rzErr?.error?.description || rzErr?.message || 'Razorpay gateway error';
    return next(new AppError(`Payment gateway error: ${msg}`, 502));
  }

  await prisma.payment.upsert({
    where:  { orderId },
    update: { razorpayOrderId: razorpayOrder.id, amount: order.total, status: 'PENDING' },
    create: { orderId, razorpayOrderId: razorpayOrder.id, amount: order.total },
  });

  sendSuccess(res, 200, 'Razorpay order created', {
    razorpayOrderId: razorpayOrder.id,
    amount:   amountInPaise,
    currency: 'INR',
    key_id:   process.env.RAZORPAY_KEY_ID,
  });
});

// ─── Verify payment → THEN finalize order (deduct stock, clear cart) ────────
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
  if (!payment) return next(new AppError('Payment record not found', 404));

  const isAuthentic = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (isAuthentic) {
    // Get order with items to deduct stock
    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { items: true }
    });

    await prisma.$transaction(async (tx) => {
      // 1. Mark payment success
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'SUCCESS',
        }
      });

      // 2. Move order to PLACED
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PLACED',
          statusHistory: { create: { status: 'PLACED', note: 'Payment verified via Razorpay' } }
        }
      });

      // 3. NOW deduct stock (only after payment confirmed)
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } }
        });
      }

      // 4. Clear customer cart
      await tx.cartItem.deleteMany({ where: { userId: order.userId } });
    });

    return sendSuccess(res, 200, 'Payment verified — order placed!', {
      orderId: order.id,
      amount:  Number(order.total),
    });
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data:  { status: 'FAILED' }
    });
    return next(new AppError('Payment verification failed. Invalid signature.', 400));
  }
});

// ─── Cash on Delivery ────────────────────────────────────────────────────────
exports.placeCOD = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  if (!order) return next(new AppError('Order not found', 404));
  if (order.status !== 'PENDING_PAYMENT') {
    return next(new AppError('Order is not awaiting payment', 400));
  }

  await prisma.$transaction(async (tx) => {
    // 1. Create COD payment record (PENDING until delivered)
    await tx.payment.create({
      data: {
        orderId,
        razorpayOrderId:   `cod_${order.id.slice(-12)}`,
        razorpayPaymentId: `cod_pending_${Date.now()}`,
        razorpaySignature: 'COD',
        amount:   order.total,
        currency: 'INR',
        status:   'PENDING',
        method:   'COD',
      }
    });
    // 2. Move order to PLACED
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PLACED',
        statusHistory: { create: { status: 'PLACED', note: 'Order placed — Cash on Delivery' } }
      }
    });
    // 3. Deduct stock
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data:  { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } }
      });
    }
    // 4. Clear cart
    await tx.cartItem.deleteMany({ where: { userId: order.userId } });
  });

  sendSuccess(res, 200, 'COD order placed!', { orderId: order.id, amount: Number(order.total), method: 'COD' });
});
