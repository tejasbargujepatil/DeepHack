# ROADMAP.md — TechDrill E-Commerce

## Milestone: MVP Production Build

### Phase 1: Project Foundation & Backend Scaffold
Set up monorepo structure, backend Express app with Prisma schema, Docker config, and base
middleware (auth, error handling, rate limiting, security headers).

### Phase 2: Authentication System
Full JWT auth with register/login/logout/refresh, bcrypt password hashing, OTP email verification,
RBAC middleware, and protected routes.

### Phase 3: Product & Inventory APIs
Product CRUD with images, categories, filters, search, sort, pagination. Stock tracking and low
stock alerts. Admin-only write routes.

### Phase 4: Cart, Wishlist & Order System
Cart CRUD, wishlist, checkout flow, order placement, order status pipeline (placed → accepted →
processed → dispatched → delivered), Socket.io real-time tracking.

### Phase 5: Payment Integration
Razorpay order creation, payment verification webhook, transaction storage, refund handling.

### Phase 6: Admin Dashboard APIs
Analytics endpoints (sales, revenue, user stats), user management (block/unblock), audit logs,
report generation (xlsx, PDF).

### Phase 7: AI Services
FAQ chatbot endpoint, product recommender system (collaborative filtering + browsing history).

### Phase 8: Frontend — Foundation
Vite + React + Tailwind setup, design system, routing, auth context, API service layer, toast
notifications, loading skeletons.

### Phase 9: Frontend — Customer Pages
Home, product listing, product detail, cart, wishlist, checkout, order tracking, order history pages.

### Phase 10: Frontend — Admin Dashboard
Admin layout, analytics charts, product management, order management, user management pages.

### Phase 11: Docker, Nginx & Deployment
Dockerfile for frontend/backend, docker-compose, Nginx config, deployment guide, README.

### Phase 12: Testing & Docs
Unit tests (Jest), Postman collection, API documentation, sample seed data.
