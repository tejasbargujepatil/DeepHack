# TechDrill — Login Credentials & Access Guide

> All demo accounts use password: **`Test@1234`**

---

## 🔑 All Account Credentials

| Role | Name | Email | Password |
|------|------|-------|----------|
| 👑 Super Admin | Super Admin | `admin@techdrill.com` | `Test@1234` |
| 🏪 Retailer A | Retailer A | `retailera@techdrill.com` | `Test@1234` |
| 🏪 Retailer B | Retailer B | `retailerb@techdrill.com` | `Test@1234` |
| 👤 Customer | John Customer | `customer@techdrill.com` | `Test@1234` |

> ✅ All accounts above exist in the database and are ready to use.

---

## 🔗 Login & Register Links

### 👤 Customer
| Action | URL |
|--------|-----|
| Login | http://localhost:5173/login |
| Register | http://localhost:5173/register |
| My Orders | http://localhost:5173/orders |

### 🏪 Retailer (Admin)
| Action | URL | Notes |
|--------|-----|-------|
| **Login** | http://localhost:5173/login | Same login page — redirects to `/admin` automatically |
| **Register** | http://localhost:5173/admin-register | Requires invite code: `TECHDRILL_ADMIN_2024` |
| Dashboard | http://localhost:5173/admin | My products, orders, revenue |

### 👑 Super Admin
| Action | URL |
|--------|-----|
| Login | http://localhost:5173/login |
| Dashboard | http://localhost:5173/admin |
| Retailers Management | http://localhost:5173/admin/retailers |
| All Users | http://localhost:5173/admin/users |

---

## 🧭 How the Login Flow Works

```
/login  ──► Enter email + password
           │
           ├─ Role = CUSTOMER  ──► Redirects to storefront (/)
           ├─ Role = ADMIN     ──► Redirects to /admin (Seller Dashboard)
           └─ Role = SUPER_ADMIN ► Redirects to /admin (Platform Admin)
```

The **same `/login` page** handles all roles. After login, the app automatically detects your role and sends you to the right place.

---

## 🏪 How to Register as a New Retailer

1. Go to http://localhost:5173/admin-register  
   *(or click "Register as Retailer 🏪" on the login page)*
2. Fill in your name, email, phone and password
3. In the **"Admin Invite Code"** field, enter: `TECHDRILL_ADMIN_2024`
4. Click **"Create Retailer Account"**
5. You'll be redirected directly to your seller dashboard at `/admin`

---

## 🏦 Razorpay Test Payments

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date e.g. `12/26` |
| CVV | Any 3 digits e.g. `123` |
| OTP | `1234` |
| UPI Test ID | `success@razorpay` |

---

## 👑 Role Permissions Summary

| Feature | Customer | Retailer (Admin) | Super Admin |
|---------|----------|-----------------|-------------|
| Browse & shop | ✅ | ✅ | ✅ |
| My orders | ✅ | ✅ | ✅ |
| Manage own products | ❌ | ✅ | ✅ |
| View own orders & revenue | ❌ | ✅ | ✅ |
| See other retailers' data | ❌ | ❌ | ✅ |
| Manage all retailers | ❌ | ❌ | ✅ |
| Block/promote users | ❌ | ❌ | ✅ |
| View all customers | ❌ | ❌ | ✅ |

---

## ⚙️ Required `.env` Values

```env
# server/.env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
ADMIN_SECRET=TECHDRILL_ADMIN_2024
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
PORT=5000

# client/.env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

*Last updated: April 2026 · TechDrill Platform*
