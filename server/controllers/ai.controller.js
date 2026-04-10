const { sendSuccess } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/db');

// ─── Intent detection helpers ───────────────────────────────────────────────
const match = (text, ...terms) => terms.some(t => text.includes(t));

// ─── AI Chatbot Handler ──────────────────────────────────────────────────────
exports.chatbotQuery = catchAsync(async (req, res) => {
  const { query = '', history = [] } = req.body;
  const q = query.toLowerCase().trim();
  // Combine current + last 3 user messages for broader context matching
  const ctx = [q, ...history.slice(-3).map(h => h.toLowerCase())].join(' ');
  let response = '';

  // ── GREETING ──
  if (match(q, 'hi', 'hello', 'hey', 'hola', 'sup', 'good morning', 'good evening', 'namaste')) {
    const greetings = [
      "⚡ Welcome to TechDrill! I'm your AI assistant.\n\nAsk me about:\n• 📦 Order tracking & status\n• 🛍️ Product recommendations\n• 💳 Payments & refunds\n• 🚚 Shipping & delivery\n• ↩ Returns & exchange policy",
      "👋 Hello! Great to have you here at TechDrill.\n\nHow can I help you today? Ask me about products, orders, shipping, or payments!",
      "🌿 Hi there! I'm TechDrill's AI assistant.\n\nI can help you find the best tech deals, track your orders, or answer any questions. What do you need?",
    ];
    response = greetings[Math.floor(Math.random() * greetings.length)];
  }

  // ── THANK YOU ──
  else if (match(q, 'thank', 'thanks', 'great', 'awesome', 'helpful', 'perfect', 'got it', 'ok ok', 'cool')) {
    response = "You're welcome! 😊 Is there anything else I can help you with?\n\nFeel free to ask about products, orders, shipping, or anything else!";
  }

  // ── ORDER TRACKING ──
  else if (match(ctx, 'track', 'where is my order', 'order status', 'my order', 'delivery status', 'when will', 'order update')) {
    if (req.user) {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { items: { select: { name: true, quantity: true } } }
      });
      if (orders.length === 0) {
        response = "You don't have any orders yet. Head to /products to start shopping! 🛒";
      } else {
        const latest = orders[0];
        const statusEmoji = { PLACED:'📋', ACCEPTED:'✅', PROCESSED:'⚙️', DISPATCHED:'🚚', DELIVERED:'📦', CANCELLED:'❌' };
        const items = latest.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
        response = `Your latest order:\n\n🆔 #${latest.id.slice(-8).toUpperCase()}\n${statusEmoji[latest.status] || '📋'} Status: **${latest.status}**\n📅 Placed: ${new Date(latest.createdAt).toLocaleDateString('en-IN')}\n💰 Total: ₹${Number(latest.total).toLocaleString('en-IN')}\n📌 Items: ${items}\n\nFor full details, visit My Orders.${orders.length > 1 ? `\n\nYou have ${orders.length} total order(s).` : ''}`;
      }
    } else {
      response = "Please **log in** to check your order status. Once logged in, visit My Orders or ask me again! 🔐";
    }
  }

  // ── RETURN / REFUND ──
  else if (match(ctx, 'return', 'refund', 'exchange', 'money back', 'cancel order', 'want to return', 'how to return')) {
    response = "↩ **Return & Refund Policy:**\n\n• Returns accepted within **7 days** of delivery\n• Items must be in original condition & packaging\n• Refunds processed to original payment in **3–5 business days**\n• To initiate: go to My Orders → Select order → Request Return\n\nNeed help? Reply with your Order ID and we'll assist you! 🙌";
  }

  // ── PAYMENT ──
  else if (match(q, 'payment', 'pay', 'upi', 'card', 'netbanking', 'razorpay', 'transaction')) {
    response = "💳 **Payment Methods:**\n\n• 💳 Credit / Debit Cards (Visa, Mastercard, Rupay)\n• 📱 UPI (Google Pay, PhonePe, Paytm)\n• 🏦 Net Banking (all major banks)\n• 👛 Wallets (Paytm, Amazon Pay)\n\nAll payments are **secured by Razorpay** with 256-bit SSL encryption. Your data is never stored on our servers. ✅";
  }

  // ── SHIPPING ──
  else if (match(q, 'shipping', 'delivery', 'delivery time', 'ship', 'arrive', 'how long')) {
    response = "🚚 **Shipping Information:**\n\n• **Standard Delivery:** 5–7 business days\n• **Express Delivery:** 2–3 business days (select cities)\n• **FREE Shipping** on orders above ₹500\n• Below ₹500: ₹50 shipping charge\n\n📍 We deliver across all major Indian cities. Track your order in real-time under My Orders!";
  }

  // ── PRODUCT SEARCH — also uses history context for follow-ups ──
  else if (match(ctx, 'laptop', 'phone', 'smartphone', 'audio', 'headphone', 'gaming', 'accessories', 'earphone', 'macbook', 'iphone', 'samsung', 'product', 'recommend', 'suggest', 'best', 'show me', 'find me', 'cheap', 'affordable', 'budget', 'popular')) {
    // Detect category — prefer current query, fall back to history context
    let categorySlug = null;
    if (match(ctx, 'laptop', 'macbook', 'notebook', 'xps', 'dell'))    categorySlug = 'laptops';
    else if (match(ctx, 'phone', 'smartphone', 'iphone', 'samsung', 'mobile', 'galaxy')) categorySlug = 'smartphones';
    else if (match(ctx, 'headphone', 'earphone', 'audio', 'speaker', 'earbud', 'airpods')) categorySlug = 'audio';
    else if (match(ctx, 'gaming', 'mouse', 'keyboard', 'controller', 'razer'))  categorySlug = 'gaming';
    else if (match(ctx, 'accessories', 'charger', 'cable', 'watch', 'anker'))  categorySlug = 'accessories';

    const where = categorySlug
      ? { category: { slug: categorySlug }, isActive: true }
      : { isFeatured: true, isActive: true };

    const products = await prisma.product.findMany({
      where,
      take: 3,
      orderBy: { rating: 'desc' },
      select: { name: true, price: true, brand: true, rating: true, stock: true }
    });

    if (products.length === 0) {
      response = `I couldn't find products in that category. Browse all products at /products!`;
    } else {
      const list = products.map((p, i) =>
        `${i + 1}. **${p.name}** — ₹${Number(p.price).toLocaleString('en-IN')} ⭐${p.rating} ${p.stock === 0 ? '(Out of Stock)' : '✅ In Stock'}`
      ).join('\n');
      response = `🔍 **${categorySlug ? categorySlug.toUpperCase() : 'Featured'} Products:**\n\n${list}\n\nVisit /products${categorySlug ? `?category=${categorySlug}` : ''} to see all options!`;
    }
  }

  // ── PRICE CHECK ──
  else if (match(q, 'price', 'cost', 'how much', 'cheap', 'expensive', 'affordable', 'budget')) {
    const cheap = await prisma.product.findFirst({ where: { isActive: true }, orderBy: { price: 'asc' }, select: { name: true, price: true } });
    const expensive = await prisma.product.findFirst({ where: { isActive: true }, orderBy: { price: 'desc' }, select: { name: true, price: true } });
    response = `💰 **Price Range at TechDrill:**\n\n• Budget pick: **${cheap?.name}** at ₹${Number(cheap?.price || 0).toLocaleString('en-IN')}\n• Premium pick: **${expensive?.name}** at ₹${Number(expensive?.price || 0).toLocaleString('en-IN')}\n\nUse /products?sort=price_asc to sort by price!`;
  }

  // ── ACCOUNT / LOGIN ──
  else if (match(q, 'account', 'login', 'sign in', 'register', 'sign up', 'forgot password', 'password')) {
    response = "🔐 **Account Help:**\n\n• **Login:** /login (use your email + password)\n• **Register:** /register (instant access — no OTP needed!)\n• **Forgot password?** Use the 'Reset Key' link on the login page\n• **Demo credentials:**\n  Admin: admin@techdrill.com\n  Customer: customer@techdrill.com\n  Password: Test@1234";
  }

  // ── CONTACT / SUPPORT ──
  else if (match(q, 'contact', 'support', 'help', 'human', 'agent', 'call', 'email')) {
    response = "📞 **Need More Help?**\n\n• 📧 Email: support@techdrill.com\n• 💬 Live Chat: Available 9 AM – 9 PM IST\n• 📱 Phone: +91 98765 43210\n\nResponse time: within 24 hours for email, real-time for chat!";
  }

  // ── WARRANTY ──
  else if (match(q, 'warranty', 'guarantee', 'repair', 'damage', 'defective')) {
    response = "🛡️ **Warranty Information:**\n\n• All products carry the **manufacturer's warranty**\n• Laptops & phones: typically 1 year\n• Accessories: 6 months\n• For defective items: contact us within 48 hours of delivery\n• We'll arrange a **free replacement or full refund**! ✅";
  }

  // ── OFFERS / DISCOUNT ──
  else if (match(q, 'offer', 'discount', 'coupon', 'promo', 'sale', 'deal', 'code')) {
    response = "🎁 **Current Offers:**\n\n• 🆓 FREE shipping on orders above ₹500\n• ⭐ Featured products have special discounts\n• 💳 No extra fees — Razorpay checkout only\n\nFilter by 'Featured' on /products to see discounted items!";
  }

  // ── FALLBACK — aware of conversation context ──
  else {
    const productCount = await prisma.product.count({ where: { isActive: true } });
    const ctxHint = history.length > 1 ? `\n\n(Earlier you asked about: "${history[history.length-1]}")` : '';
    response = `🤖 I'm not sure about that, but I'm happy to help!\n\nHere's what I can do:\n• 📦 Track your orders\n• 🛍️ Find products (we have ${productCount} items!)\n• 💳 Payment & refund info\n• 🚚 Shipping & delivery\n• 🔐 Account help\n• 🛡️ Warranty & returns${ctxHint}\n\nTry: "Where is my order?" or "Show me the best laptops"`;
  }

  sendSuccess(res, 200, 'Chatbot responded', { response });
});

// ─── Product Recommendations ─────────────────────────────────────────────────
exports.getRecommendations = catchAsync(async (req, res) => {
  const featured = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 6,
    orderBy: { rating: 'desc' },
    select: { id: true, name: true, price: true, brand: true, rating: true, images: { take: 1 } }
  });
  sendSuccess(res, 200, 'Recommendations retrieved', featured);
});
