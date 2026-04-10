const prisma = require('../config/db');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { getPagination } = require('../utils/helpers');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { notifyOrderUpdate } = require('../sockets');

// ─── Create Order (PENDING_PAYMENT — no stock deduct yet) ──────────────────
exports.createOrder = catchAsync(async (req, res, next) => {
  const { addressId, notes } = req.body;
  const userId = req.user.id;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });
  if (cartItems.length === 0) return next(new AppError('Your cart is empty', 400));

  // Validate stock
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return next(new AppError(`"${item.product.name}" only has ${item.product.stock} in stock`, 400));
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItemsData = [];
  for (const item of cartItems) {
    const itemTotal = Number(item.quantity) * Number(item.product.price);
    subtotal += itemTotal;
    orderItemsData.push({
      productId: item.productId,
      name:      item.product.name,
      price:     item.product.price,
      quantity:  item.quantity,
      total:     itemTotal,
      image:     item.product.images?.[0]?.url || null,
    });
  }

  const tax            = subtotal * 0.18;
  const shippingCharge = subtotal > 500 ? 0 : 50;
  const total          = subtotal + tax + shippingCharge;

  // ⚠️ Order is PENDING_PAYMENT — stock is NOT decremented yet, cart is NOT cleared
  const order = await prisma.order.create({
    data: {
      userId, addressId, subtotal, tax, shippingCharge, total, notes,
      status: 'PENDING_PAYMENT',
      items: { create: orderItemsData },
      statusHistory: { create: { status: 'PENDING_PAYMENT', note: 'Awaiting payment' } }
    },
    include: { items: true }
  });

  sendSuccess(res, 201, 'Order created — awaiting payment', order);
});

// ─── Get My Orders ──────────────────────────────────────────────────────────
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const { page, limit, skip, take } = getPagination(req.query.page, req.query.limit);
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user.id, NOT: { status: 'PENDING_PAYMENT' } },
      orderBy: { createdAt: 'desc' },
      skip, take,
      include: { items: { select: { name: true, quantity: true, price: true, image: true } } }
    }),
    prisma.order.count({ where: { userId: req.user.id, NOT: { status: 'PENDING_PAYMENT' } } })
  ]);
  sendPaginated(res, orders, page, limit, total);
});

// ─── Get Single Order ───────────────────────────────────────────────────────
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, address: true, statusHistory: { orderBy: { createdAt: 'asc' } }, payment: true }
  });
  if (!order) return next(new AppError('Order not found', 404));
  if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return next(new AppError('Access denied', 403));
  }
  sendSuccess(res, 200, 'Order retrieved', order);
});

// ─── Admin: Get All Orders ──────────────────────────────────────────────────
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { page, limit, skip, take } = getPagination(req.query.page, req.query.limit);
  const where = {
    NOT: { status: 'PENDING_PAYMENT' }, // hide unpaid orders from admin list
    ...(req.query.status ? { status: req.query.status } : {}),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' }, skip, take,
      include: { user: { select: { name: true, email: true } }, items: true }
    }),
    prisma.order.count({ where })
  ]);
  sendPaginated(res, orders, page, limit, total);
});

// ─── Admin: Update Order Status ─────────────────────────────────────────────
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const VALID = ['PLACED','ACCEPTED','PROCESSED','DISPATCHED','DELIVERED','CANCELLED'];
  if (!VALID.includes(status)) return next(new AppError('Invalid status', 400));

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, statusHistory: { create: { status, note: note || `Order marked as ${status}` } } }
  });
  notifyOrderUpdate(order.id, { status, note });
  sendSuccess(res, 200, 'Order status updated', order);
});
