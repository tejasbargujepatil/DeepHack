const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { getPagination } = require('../utils/helpers');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Middleware to set req.params.id to logged in user's ID
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, name: true, email: true, phone: true, role: true, 
      avatar: true, createdAt: true,
      addresses: true
    }
  });

  if (!user) return next(new AppError('User not found', 404));

  sendSuccess(res, 200, 'User retrieved', user);
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Can only update fields that are safe
  const { name, phone, avatar } = req.body;
  
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, avatar },
    select: { id: true, name: true, email: true, phone: true, avatar: true }
  });

  sendSuccess(res, 200, 'Profile updated', user);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return next(new AppError('Incorrect current password', 401));

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword }
  });

  // Optional: clear all refresh tokens forcing re-login across devices
  await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });

  sendSuccess(res, 200, 'Password updated successfully');
});

// ADDRESS OPERATIONS
exports.getAddresses = catchAsync(async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  sendSuccess(res, 200, 'Addresses retrieved', addresses);
});

exports.addAddress = catchAsync(async (req, res, next) => {
  const { label, line1, line2, city, state, pincode, phone } = req.body;
  if (!line1 || !city || !state || !pincode || !phone) return next(new AppError('All address fields are required', 400));
  const address = await prisma.address.create({
    data: { userId: req.user.id, label: label || 'Home', line1, line2, city, state, pincode, phone }
  });
  sendSuccess(res, 201, 'Address added', address);
});

exports.deleteAddress = catchAsync(async (req, res) => {
  await prisma.address.delete({ where: { id: req.params.id } }).catch(() => {});
  sendSuccess(res, 200, 'Address deleted');
});

// CART OPERATIONS
exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return next(new AppError('Product not found', 404));

  if (product.stock < quantity) {
    return next(new AppError('Not enough stock available', 400));
  }

  const cartItem = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    update: { quantity: { increment: quantity } }, // Note: You might want to SET quantity instead of INCREMENT depending on frontend logic
    create: { userId: req.user.id, productId, quantity }
  });

  sendSuccess(res, 200, 'Added to cart', cartItem);
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  await prisma.cartItem.delete({
    where: { userId_productId: { userId: req.user.id, productId } }
  }).catch(() => {}); // ignore error if it doesn't exist

  sendSuccess(res, 200, 'Removed from cart');
});

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: { select: { id: true, name: true, slug: true, price: true, images: { take: 1 } } } }
  });
  
  sendSuccess(res, 200, 'Cart retrieved', cart);
});

// WISHLIST OPERATIONS
exports.addToWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  const wishlist = await prisma.wishlist.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    update: {},
    create: { userId: req.user.id, productId }
  });

  sendSuccess(res, 200, 'Added to wishlist', wishlist);
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  await prisma.wishlist.delete({
    where: { userId_productId: { userId: req.user.id, productId } }
  }).catch(() => {});

  sendSuccess(res, 200, 'Removed from wishlist');
});

exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: { product: { select: { id: true, name: true, slug: true, price: true, images: { take: 1 } } } }
  });
  
  sendSuccess(res, 200, 'Wishlist retrieved', wishlist);
});

// ADMIN ROUTES
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { page, limit, skip, take } = getPagination(req.query.page, req.query.limit);
  const { role, search } = req.query;

  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, isBlocked: true, createdAt: true },
      skip, take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  sendPaginated(res, users, page, limit, total);
});

// SUPER_ADMIN only — list all retailer/admin accounts with their store stats
exports.getAllAdmins = catchAsync(async (req, res, next) => {
  const { page, limit, skip, take } = getPagination(req.query.page, req.query.limit);

  const where = { role: { in: ['ADMIN', 'SUPER_ADMIN'] } };

  const [admins, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        isBlocked: true, createdAt: true,
        _count: { select: { products: true } }
      },
      skip, take,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  if (admins.length === 0) {
    return sendPaginated(res, [], page, limit, total);
  }

  // For each admin, aggregate their revenue + order count using Prisma ORM (no raw SQL)
  const adminIds = admins.map(a => a.id);

  // Get all products per admin
  const products = await prisma.product.findMany({
    where: { adminId: { in: adminIds } },
    select: { id: true, adminId: true }
  });

  const productsByAdmin = {};
  for (const p of products) {
    if (!productsByAdmin[p.adminId]) productsByAdmin[p.adminId] = [];
    productsByAdmin[p.adminId].push(p.id);
  }

  // Aggregate revenue + order counts per admin
  const revenueMap = {};

  await Promise.all(
    adminIds.map(async (adminId) => {
      const pIds = productsByAdmin[adminId] || [];
      if (pIds.length === 0) {
        revenueMap[adminId] = { revenue: 0, orders: 0 };
        return;
      }

      const [revenueAgg, orderCount] = await Promise.all([
        // Revenue from order items (exclude cancelled/pending)
        prisma.orderItem.aggregate({
          _sum: { total: true },
          where: {
            productId: { in: pIds },
            order: { status: { notIn: ['CANCELLED', 'PENDING_PAYMENT'] } }
          }
        }),
        // Distinct order count
        prisma.order.count({
          where: {
            items: { some: { productId: { in: pIds } } },
            status: { notIn: ['CANCELLED', 'PENDING_PAYMENT'] }
          }
        })
      ]);

      revenueMap[adminId] = {
        revenue: Number(revenueAgg._sum.total || 0),
        orders: orderCount
      };
    })
  );

  const data = admins.map(a => ({
    ...a,
    productCount: a._count.products,
    revenue:      revenueMap[a.id]?.revenue   || 0,
    orderCount:   revenueMap[a.id]?.orders    || 0,
  }));

  sendPaginated(res, data, page, limit, total);
});


exports.toggleBlockStatus = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return next(new AppError('User not found', 404));

  if (user.role === 'SUPER_ADMIN') return next(new AppError('Cannot block Super Admin', 400));

  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBlocked: !user.isBlocked },
    select: { id: true, name: true, isBlocked: true }
  });

  sendSuccess(res, 200, `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`, updatedUser);
});

exports.updateRole = catchAsync(async (req, res, next) => {
    const { role } = req.body;
    
    if (!['CUSTOMER', 'EMPLOYEE', 'ADMIN'].includes(role)) {
        return next(new AppError('Invalid role', 400));
    }

    const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: { role },
        select: { id: true, name: true, role: true }
    });

    sendSuccess(res, 200, `User role updated to ${role}`, updatedUser);
});
