# SPEC.md — TechDrill E-Commerce Platform

> Status: FINALIZED
> Version: 1.0.0
> Date: 2026-04-09

---

## Project Overview

**TechDrill** is a production-grade, AI-powered e-commerce web application built for scale. It
targets electronics/tech products and supports customer shopping, admin management, and AI-driven
recommendations with real-time order tracking.

---

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Axios
- React Router DOM v6

### Backend
- Node.js + Express.js
- PostgreSQL (via Prisma ORM)
- Socket.io (real-time)
- Redis (caching — optional)

### Infrastructure
- Docker + docker-compose
- Nginx (reverse proxy)
- AWS EC2 + RDS
- Netlify (frontend)

### Integrations
- Razorpay (payments)
- JWT Authentication (access + refresh tokens)
- Socket.io (real-time order updates)

---

## Architecture

- MVC pattern (backend)
- RESTful APIs
- Modular folder structure
- RBAC (admin, employee, customer)
- Stateless backend (JWT)
- DB indexing on high-query columns
- API rate limiting (express-rate-limit)
- Helmet.js security headers
- Joi/Zod input validation

---

## Features

### Authentication
- Register with email + OTP verification
- Login / logout
- Password hashing (bcrypt)
- Access + refresh token system
- Role-based protected routes

### Customer
- Product listing with filters, search, sort, pagination
- Product detail page (images, specs, reviews)
- Cart management (add, remove, update qty)
- Wishlist
- Checkout flow (address + payment)
- Razorpay payment integration
- Order placement + tracking (Socket.io real-time)
- Order history

### Admin
- Dashboard with analytics (charts)
- Product CRUD (add/update/delete/discount)
- Stock management + low stock alerts
- Order management (accept/reject, status pipeline)
- User management (block/unblock)
- Audit logs
- Multiple admin roles

### Reports
- Sales, Payment, Order reports
- Export: Excel (xlsx), PDF

### AI Features
- FAQ chatbot (order tracking queries, product advice)
- Product recommender (browsing + purchase history + collaborative)

---

## API Routes
- /api/auth
- /api/products
- /api/orders
- /api/users
- /api/payments
- /api/reports
- /api/ai

---

## Deployment
- Frontend: Netlify
- Backend: AWS EC2 + PM2 + Nginx
- DB: AWS RDS PostgreSQL

---

## Security
- CORS config
- Rate limiting
- Input sanitization
- SQL injection protection via Prisma
- Helmet.js headers

---

## Status: FINALIZED
