const prisma    = require('../config/db');
const { slugify, getPagination } = require('../utils/helpers');
const { sendSuccess, sendPaginated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError   = require('../utils/AppError');

// ─── Create Product — assigned to the admin creating it ────────────────────
exports.createProduct = catchAsync(async (req, res, next) => {
  const { images, specs, ...rest } = req.body;

  // Generate unique slug
  let slug = slugify(rest.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  rest.slug  = slug;
  rest.adminId = req.user.id;

  const category = await prisma.category.findUnique({ where: { id: rest.categoryId } });
  if (!category) return next(new AppError('Category not found', 404));

  const product = await prisma.product.create({
    data: {
      ...rest,
      specs: specs || undefined,
      // Support array of image URLs → stored as ProductImage records
      images: images?.length
        ? { create: images.map((url, i) => ({ url: url.trim(), alt: rest.name, order: i })) }
        : undefined,
    },
    include: { images: true, category: { select: { name: true } } }
  });

  sendSuccess(res, 201, 'Product created', product);
});

// ─── Public: Get all products ───────────────────────────────────────────────
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page, limit, skip, take } = getPagination(req.query.page, req.query.limit);
  const { search, category: categorySlug, minPrice, maxPrice, brand, sort } = req.query;

  const where = { isActive: true };
  if (search) {
    where.OR = [
      { name:        { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags:        { has: search } }
    ];
  }
  if (categorySlug) where.category = { slug: categorySlug };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (brand) where.brand = { equals: brand, mode: 'insensitive' };

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc')   orderBy = { price: 'asc' };
  if (sort === 'price_desc')  orderBy = { price: 'desc' };
  if (sort === 'rating_desc') orderBy = { rating: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take,
      include: { images: true, category: { select: { name: true, slug: true } } }
    }),
    prisma.product.count({ where })
  ]);

  sendPaginated(res, products, page, limit, total);
});

// ─── Public: Get single product ─────────────────────────────────────────────
exports.getProduct = catchAsync(async (req, res, next) => {
  const { identifier } = req.params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: identifier }, { slug: identifier }], isActive: true },
    include: {
      images: true,
      category: { select: { name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        take: 5, orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!product) return next(new AppError('Product not found', 404));

  if (req.user) {
    prisma.browsingHistory.upsert({
      where: { userId_productId: { userId: req.user.id, productId: product.id } },
      update: { viewCount: { increment: 1 }, lastViewed: new Date() },
      create: { userId: req.user.id, productId: product.id }
    }).catch(() => {});
  }

  sendSuccess(res, 200, 'Product retrieved', product);
});

// ─── Admin: Get OWN products only ───────────────────────────────────────────
exports.getAdminProducts = catchAsync(async (req, res, next) => {
  const { page, limit, skip, take } = getPagination(req.query.page, req.query.limit);
  const { search } = req.query;

  const where = { adminId: req.user.id };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy: { createdAt: 'desc' }, skip, take,
      include: { images: true, category: { select: { name: true } } }
    }),
    prisma.product.count({ where })
  ]);

  sendPaginated(res, products, page, limit, total);
});

// ─── Update product (must own it) ───────────────────────────────────────────
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { images, specs, ...data } = req.body;
  if (data.name) {
    let slug = slugify(data.name);
    const existing = await prisma.product.findFirst({ where: { slug, NOT: { id: req.params.id } } });
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    data.slug = slug;
  }

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new AppError('Product not found', 404));
  if (existing.adminId && existing.adminId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('You can only edit your own products', 403));
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...data,
      specs: specs || undefined,
      // Replace images if provided
      ...(images?.length ? {
        images: {
          deleteMany: {},
          create: images.map((url, i) => ({ url: url.trim(), alt: data.name || existing.name, order: i }))
        }
      } : {})
    },
    include: { images: true }
  });

  sendSuccess(res, 200, 'Product updated', product);
});

// ─── Delete product (must own it) ───────────────────────────────────────────
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new AppError('Product not found', 404));
  if (existing.adminId && existing.adminId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('You can only delete your own products', 403));
  }
  await prisma.product.delete({ where: { id: req.params.id } });
  sendSuccess(res, 200, 'Product deleted');
});
