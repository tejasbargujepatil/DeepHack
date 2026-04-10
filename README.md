# 🛒 TechDrill — AI-Powered E-Commerce Platform

A production-grade, scalable e-commerce platform built with React, Node.js, PostgreSQL, and Socket.io.

## 🚀 Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Axios    |
| Backend     | Node.js, Express.js, Prisma ORM        |
| Database    | PostgreSQL 15                          |
| Realtime    | Socket.io                              |
| Payments    | Razorpay                               |
| Auth        | JWT (Access + Refresh tokens)          |
| Docker      | Postgres + Redis + Backend + Frontend  |
| Deploy      | Netlify (FE) + AWS EC2 + RDS (BE)     |

---

## 📁 Project Structure

```
TechDrill-Ecom/
├── server/                   # Express backend
│   ├── controllers/          # Route handlers
│   ├── routes/               # API routes
│   ├── middlewares/          # Auth, validation, errors
│   ├── services/             # Business logic
│   ├── utils/                # Helpers, logger, JWT
│   ├── config/               # DB, email, Razorpay
│   ├── sockets/              # Socket.io setup
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Sample data
│   ├── app.js                # Express app
│   └── server.js             # Entry point
│
├── client/                   # React frontend
│   └── src/
│       ├── components/       # Navbar, Footer, ProductCard, Chatbot
│       ├── pages/            # Home, Products, Cart, Orders, Auth
│       │   └── admin/        # Dashboard, Products, Orders, Users
│       ├── context/          # Auth, Cart, Theme
│       ├── services/         # Axios API layer
│       └── utils/
│
├── docker-compose.yml        # Full stack orchestration
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- A Razorpay account (for payments)

### 1. Clone & setup environment

```bash
git clone https://github.com/your-org/techdrill-ecom.git
cd techdrill-ecom

# Backend .env
cp server/.env.example server/.env
# Edit server/.env with your credentials

# Frontend .env
cp client/.env.example client/.env
```

### 2. Start the database (Docker)

```bash
docker compose up -d postgres redis
```

### 3. Backend setup

```bash
cd server
npm install
npm run db:migrate      # Run migrations
npm run db:seed         # Seed sample data
npm run dev             # Start on http://localhost:5000
```

### 4. Frontend setup

```bash
cd ../client
npm install
npm run dev             # Start on http://localhost:5173
```

---

## 🔑 Default Login Credentials (after seeding)

| Role       | Email                       | Password   |
|------------|-----------------------------|------------|
| Super Admin | admin@techdrill.com        | Test@1234  |
| Customer   | customer@techdrill.com      | Test@1234  |

---

## 🐳 Docker (Full Stack)

```bash
cp server/.env.example server/.env   # Fill in values
docker compose up --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:5000/api
- PostgreSQL: localhost:5433

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                        | Description              | Auth     |
|--------|---------------------------------|--------------------------|----------|
| POST   | /auth/register                  | Register user            | Public   |
| POST   | /auth/verify-email              | Verify OTP               | Public   |
| POST   | /auth/login                     | Login                    | Public   |
| POST   | /auth/logout                    | Logout                   | Public   |
| GET    | /products                       | List products (filters)  | Public   |
| GET    | /products/:id                   | Get product              | Public   |
| POST   | /products                       | Create product           | Admin    |
| PUT    | /products/:id                   | Update product           | Admin    |
| DELETE | /products/:id                   | Delete product           | Admin    |
| GET    | /categories                     | List categories          | Public   |
| POST   | /users/cart                     | Add to cart              | User     |
| GET    | /users/cart                     | Get cart                 | User     |
| DELETE | /users/cart/:productId          | Remove from cart         | User     |
| POST   | /users/wishlist                 | Add to wishlist          | User     |
| GET    | /users/wishlist                 | Get wishlist             | User     |
| POST   | /orders                         | Place order              | User     |
| GET    | /orders/my-orders               | My orders                | User     |
| GET    | /orders/:id                     | Order detail             | User     |
| GET    | /orders                         | All orders               | Admin    |
| PATCH  | /orders/:id/status              | Update status            | Admin    |
| POST   | /payments/create-razorpay-order | Initiate payment         | User     |
| POST   | /payments/verify                | Verify payment           | User     |
| GET    | /reports/dashboard-stats        | Admin analytics          | Admin    |
| GET    | /reports/sales-report           | Sales chart data         | Admin    |
| GET    | /reports/export-sales           | Download Excel report    | Admin    |
| POST   | /ai/chat                        | AI chatbot               | Public   |
| GET    | /ai/recommendations             | Product recommendations  | Public   |

---

## 🔒 Authentication

JWT Bearer token required for protected routes:

```
Authorization: Bearer <access_token>
```

Tokens:
- **Access Token**: 15 minutes TTL
- **Refresh Token**: 7 days TTL (stored in DB)

---

## 🌐 Production Deployment

### Frontend → Netlify

```bash
cd client
npm run build

# Set environment variables in Netlify dashboard:
# VITE_API_URL=https://api.yourdomain.com/api
# VITE_SOCKET_URL=https://api.yourdomain.com
# VITE_RAZORPAY_KEY_ID=your_razorpay_key

# Add _redirects for React Router
echo "/* /index.html 200" > dist/_redirects
netlify deploy --prod --dir=dist
```

### Backend → AWS EC2

```bash
# SSH into EC2
ssh -i keypair.pem ubuntu@your-ec2-ip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Deploy app
git clone https://github.com/your-org/techdrill-ecom.git
cd techdrill-ecom/server
npm ci --only=production
cp .env.example .env  # fill in RDS URL etc.
npx prisma migrate deploy
node prisma/seed.js

# Start with PM2
pm2 start server.js --name "techdrill-api"
pm2 startup && pm2 save
```

### Nginx Reverse Proxy (EC2)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🧪 Testing

```bash
cd server
npm test            # Run Jest unit tests
```

---

## 🛡 Security Features

- ✅ Helmet.js headers
- ✅ CORS whitelist
- ✅ Rate limiting (100 req/15min, 10 req/15min for auth)
- ✅ Input validation (Joi)
- ✅ SQL injection protection (Prisma ORM)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ JWT with refresh token rotation
- ✅ Role-based access control (SUPER_ADMIN, ADMIN, EMPLOYEE, CUSTOMER)

---

## 🤖 AI Features

- **Chatbot**: Rule-based FAQ bot answering orders, returns, payments
- **Recommendations**: Content-based + collaborative filtering using browsing history

---

Made with ❤️ by TechDrill Team
