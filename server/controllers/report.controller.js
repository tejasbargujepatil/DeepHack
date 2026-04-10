const prisma     = require('../config/db');
const { sendSuccess } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const xlsx       = require('xlsx');
const PDFDocument = require('pdfkit');

// ─── Helper: get admin's product IDs ─────────────────────────────────────────
async function getAdminProductIds(adminId) {
  const products = await prisma.product.findMany({
    where: { adminId }, select: { id: true, name: true, price: true }
  });
  return products;
}

// ─── Admin Dashboard Stats ─────────────────────────────────────────────────
exports.getDashboardStats = catchAsync(async (req, res) => {
  const adminId  = req.user.id;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  const productFilter  = isSuperAdmin ? {} : { adminId };
  const adminProducts  = await prisma.product.findMany({ where: productFilter, select: { id: true } });
  const productIds     = adminProducts.map(p => p.id);

  const orderWhere = productIds.length
    ? { items: { some: { productId: { in: productIds } } }, status: { notIn: ['PENDING_PAYMENT'] } }
    : { status: { notIn: ['PENDING_PAYMENT'] } };

  const [revenueData, myProducts, totalOrders, recentOrders,
         ordersByStatus, topProducts, monthlyOrders] = await Promise.all([

    // Revenue
    prisma.orderItem.aggregate({
      _sum: { total: true },
      where: {
        ...(productIds.length ? { productId: { in: productIds } } : {}),
        order: { status: { notIn: ['CANCELLED', 'PENDING_PAYMENT'] } }
      }
    }),

    // Product count
    prisma.product.count({ where: productFilter }),

    // Order count
    prisma.order.count({ where: { ...orderWhere, status: { notIn: ['CANCELLED','PENDING_PAYMENT'] } } }),

    // Recent 5 orders
    prisma.order.findMany({
      take: 5, where: orderWhere, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } }
    }),

    // Orders by status (donut chart)
    prisma.order.groupBy({
      by: ['status'], where: orderWhere, _count: { id: true }
    }),

    // Top 5 products by sold count
    prisma.product.findMany({
      where: { ...productFilter, isActive: true },
      orderBy: { soldCount: 'desc' },
      take: 5,
      select: { id: true, name: true, soldCount: true, price: true, images: { take: 1, select: { url: true } } }
    }),

    // Monthly revenue last 6 months
    prisma.order.findMany({
      where: {
        ...orderWhere,
        status: { notIn: ['CANCELLED','PENDING_PAYMENT'] },
        createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
      },
      select: { createdAt: true, total: true }
    }),
  ]);

  // Build monthly chart data
  const monthMap = {};
  monthlyOrders.forEach(o => {
    const key = o.createdAt.toISOString().substring(0, 7); // YYYY-MM
    monthMap[key] = (monthMap[key] || 0) + Number(o.total);
  });
  const monthlyChartData = Object.entries(monthMap)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month: new Date(month + '-01').toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
      revenue: Math.round(revenue)
    }));

  const statusData = ordersByStatus.map(s => ({ status: s.status, count: s._count.id }));
  const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

  sendSuccess(res, 200, 'Dashboard stats', {
    totalUsers:       totalCustomers,
    totalProducts:    myProducts,
    totalOrders,
    totalRevenue:     revenueData._sum.total || 0,
    recentOrders,
    ordersByStatus:   statusData,
    topProducts,
    monthlyChartData,
  });
});

// ─── Sales Chart Report ────────────────────────────────────────────────────
exports.getSalesReport = catchAsync(async (req, res) => {
  const adminId  = req.user.id;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  const { startDate, endDate } = req.query;

  const adminProducts = isSuperAdmin ? [] :
    await prisma.product.findMany({ where: { adminId }, select: { id: true } });
  const productIds = adminProducts.map(p => p.id);

  const where = {
    status: { notIn: ['CANCELLED', 'PENDING_PAYMENT'] },
    ...(productIds.length ? { items: { some: { productId: { in: productIds } } } } : {}),
    ...(startDate && endDate ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } : {}),
  };

  const orders = await prisma.order.findMany({
    where, orderBy: { createdAt: 'asc' }, select: { createdAt: true, total: true }
  });

  const salesByDate = orders.reduce((acc, o) => {
    const date = o.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + Number(o.total);
    return acc;
  }, {});

  const chartData = Object.entries(salesByDate).map(([date, revenue]) => ({ date, revenue }));
  sendSuccess(res, 200, 'Sales report', chartData);
});

// ─── Export to Excel ──────────────────────────────────────────────────────
exports.exportSalesToExcel = catchAsync(async (req, res) => {
  const adminId  = req.user.id;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  const adminProducts = isSuperAdmin ? [] :
    await prisma.product.findMany({ where: { adminId }, select: { id: true } });
  const productIds = adminProducts.map(p => p.id);

  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ['CANCELLED', 'PENDING_PAYMENT'] },
      ...(productIds.length ? { items: { some: { productId: { in: productIds } } } } : {}),
    },
    include: {
      user:    { select: { name: true, email: true } },
      payment: { select: { status: true, method: true } },
      items:   { select: { name: true, quantity: true, price: true, total: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  // Summary sheet
  const summaryRows = orders.map(o => ({
    'Order ID':       o.id.slice(-8).toUpperCase(),
    'Date':           o.createdAt.toISOString().split('T')[0],
    'Customer':       o.user.name,
    'Email':          o.user.email,
    'Status':         o.status,
    'Payment':        o.payment?.status  || 'N/A',
    'Method':         o.payment?.method  || 'N/A',
    'Total (₹)':      Number(o.total),
  }));

  // Items sheet
  const itemRows = orders.flatMap(o =>
    o.items.map(item => ({
      'Order ID':   o.id.slice(-8).toUpperCase(),
      'Date':       o.createdAt.toISOString().split('T')[0],
      'Customer':   o.user.name,
      'Product':    item.name,
      'Qty':        item.quantity,
      'Unit Price': Number(item.price),
      'Line Total': Number(item.total),
    }))
  );

  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(summaryRows), 'Orders Summary');
  xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(itemRows),    'Order Items');

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="TechDrill_Sales_Report.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// ─── Export to PDF ────────────────────────────────────────────────────────
exports.exportSalesToPDF = catchAsync(async (req, res) => {
  const adminId  = req.user.id;
  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  const adminProducts = isSuperAdmin ? [] :
    await prisma.product.findMany({ where: { adminId }, select: { id: true } });
  const productIds = adminProducts.map(p => p.id);

  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ['CANCELLED', 'PENDING_PAYMENT'] },
      ...(productIds.length ? { items: { some: { productId: { in: productIds } } } } : {}),
    },
    include: {
      user:    { select: { name: true, email: true } },
      payment: { select: { status: true, method: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const fmt = n => `Rs. ${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Disposition', 'attachment; filename="TechDrill_Sales_Report.pdf"');
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  // Header
  doc.rect(0, 0, 595, 80).fill('#1B3C1A');
  doc.fillColor('#fff').fontSize(22).font('Helvetica-Bold').text('TechDrill', 50, 22);
  doc.fontSize(10).font('Helvetica').text('Sales Performance Report', 50, 48);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 50, 62);

  // Summary box
  doc.fillColor('#1B3C1A').rect(50, 100, 495, 60).stroke();
  doc.fillColor('#0D1B0D').fontSize(11).font('Helvetica-Bold')
     .text(`Total Orders: ${orders.length}`, 70, 115)
     .text(`Total Revenue: ${fmt(totalRevenue)}`, 250, 115)
     .text(`Avg Order: ${fmt(orders.length ? totalRevenue / orders.length : 0)}`, 420, 115);

  doc.fillColor('#6B806B').fontSize(9).font('Helvetica')
     .text('All figures exclude cancelled and pending payment orders.', 70, 138);

  // Table header
  let y = 180;
  const cols = { id: 50, date: 120, customer: 200, status: 330, method: 410, total: 480 };

  doc.rect(50, y - 8, 495, 22).fill('#E8F5E9');
  doc.fillColor('#1B3C1A').fontSize(9).font('Helvetica-Bold');
  doc.text('ORDER ID',  cols.id,       y);
  doc.text('DATE',      cols.date,     y);
  doc.text('CUSTOMER',  cols.customer, y);
  doc.text('STATUS',    cols.status,   y);
  doc.text('METHOD',    cols.method,   y);
  doc.text('TOTAL',     cols.total,    y);

  y += 22;
  doc.fillColor('#0D1B0D').fontSize(8.5).font('Helvetica');

  orders.forEach((o, i) => {
    if (y > 750) { doc.addPage(); y = 50; }
    if (i % 2 === 0) doc.rect(50, y - 4, 495, 18).fill('#F8FAF8').fillColor('#0D1B0D');

    doc.text('#' + o.id.slice(-8).toUpperCase(),          cols.id,       y, { width: 65 });
    doc.text(o.createdAt.toISOString().split('T')[0],     cols.date,     y, { width: 75 });
    doc.text(o.user.name || '—',                          cols.customer, y, { width: 120 });
    doc.text(o.status,                                    cols.status,   y, { width: 75 });
    doc.text(o.payment?.method || 'Online',               cols.method,   y, { width: 65 });
    doc.text(fmt(o.total),                                cols.total,    y, { width: 80 });
    y += 18;
  });

  // Footer
  doc.rect(50, y + 20, 495, 1).fill('#E8EDEA');
  doc.fillColor('#9FAF9F').fontSize(8)
     .text('TechDrill Technologies Pvt. Ltd. · support@techdrill.com · GSTIN: 27AXXXX0000X1Z5', 50, y + 30, { align: 'center', width: 495 });

  doc.end();
});
