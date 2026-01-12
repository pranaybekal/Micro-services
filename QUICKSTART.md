# 🚀 Quick Start Guide

## Prerequisites

Make sure you have these installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v7 or higher)

## Option 1: Automated Setup (Windows)

### Step 1: Run Setup Script
```bash
setup.bat
```

This will:
- Create all `.env` files from examples
- Install dependencies for all services

### Step 2: Setup Databases

**Option A: Using psql**
```bash
psql -U postgres
CREATE DATABASE ecommerce_users;
CREATE DATABASE ecommerce_products;
CREATE DATABASE ecommerce_orders;
CREATE DATABASE ecommerce_inventory;
\q
```

**Option B: Using pgAdmin**
- Open pgAdmin
- Right-click on "Databases" → Create → Database
- Create the 4 databases listed above

### Step 3: Start All Services
```powershell
.\start-all.ps1
```

This starts all 7 services in the background!

### Step 4: Access the Application
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000

### Stop All Services
```powershell
.\stop-all.ps1
```

---

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
# API Gateway
cd api-gateway
npm install
cd ..

# Services
cd services/user-service && npm install && cd ../..
cd services/product-service && npm install && cd ../..
cd services/cart-service && npm install && cd ../..
cd services/order-service && npm install && cd ../..
cd services/inventory-service && npm install && cd ../..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in each service folder:
```bash
cp api-gateway/.env.example api-gateway/.env
cp services/user-service/.env.example services/user-service/.env
cp services/product-service/.env.example services/product-service/.env
cp services/cart-service/.env.example services/cart-service/.env
cp services/order-service/.env.example services/order-service/.env
cp services/inventory-service/.env.example services/inventory-service/.env
cp frontend/.env.example frontend/.env
```

### 3. Start Each Service (in separate terminals)

**Terminal 1: API Gateway**
```bash
cd api-gateway
npm run dev
```

**Terminal 2: User Service**
```bash
cd services/user-service
npm run dev
```

**Terminal 3: Product Service**
```bash
cd services/product-service
npm run dev
```

**Terminal 4: Cart Service**
```bash
cd services/cart-service
npm run dev
```

**Terminal 5: Order Service**
```bash
cd services/order-service
npm run dev
```

**Terminal 6: Inventory Service**
```bash
cd services/inventory-service
npm run dev
```

**Terminal 7: Frontend**
```bash
cd frontend
npm run dev
```

---

## Option 3: Docker Setup (Easiest!)

```bash
docker-compose up
```

This will:
- Start PostgreSQL and Redis
- Create all databases automatically
- Start all microservices
- Start the frontend

Access the app at: http://localhost:5173

To stop:
```bash
docker-compose down
```

---

## 📝 Default Data

The services will automatically create tables on first run. Categories are pre-populated:
- Electronics
- Clothing
- Books
- Home & Kitchen
- Sports

---

## 🎯 Testing the Application

### 1. Register a New User
- Go to http://localhost:5173/register
- Create an account

### 2. Add Products (Admin)
- Login and go to http://localhost:5173/inventory
- Click "Add Product"
- Fill in product details

### 3. Shop!
- Browse products at http://localhost:5173/products
- Add items to cart
- Checkout with COD (Cash on Delivery)
- View your orders at http://localhost:5173/orders

---

## 🔧 Configuration

### Database Connection
Edit `.env` in each service to change database settings:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/database_name
```

### Service Ports
- Frontend: 5173
- API Gateway: 3000
- User Service: 3001
- Product Service: 3002
- Cart Service: 3003
- Order Service: 3004
- Inventory Service: 3005
- PostgreSQL: 5432
- Redis: 6379

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Windows: Kill process on port (e.g., 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Failed
- Make sure PostgreSQL is running
- Check credentials in `.env` files
- Verify databases are created

### Redis Connection Failed
- Make sure Redis is running
- Windows: Use Redis on WSL or Docker
- Check Redis URL in cart-service `.env`

### Service Not Starting
- Check if all dependencies are installed
- Look for error messages in terminal
- Make sure all `.env` files exist

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/categories` - Get all categories

### Cart
- `GET /api/cart/:userId` - Get user cart
- `POST /api/cart/:userId/items` - Add item to cart
- `PUT /api/cart/:userId/items/:productId` - Update quantity
- `DELETE /api/cart/:userId/items/:productId` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get order by ID

### Inventory (Admin)
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory/add-product` - Add product with stock
- `PUT /api/inventory/:productId` - Update stock

---

## 🎨 UI Features

- ✅ Modern, responsive design with TailwindCSS
- ✅ Product search and filtering
- ✅ Shopping cart with real-time updates
- ✅ User authentication
- ✅ Order tracking
- ✅ Inventory management dashboard
- ✅ Toast notifications
- ✅ Loading states

---

## 📦 Tech Stack Summary

**Frontend**: React 18, Vite, TailwindCSS, Zustand, React Router  
**Backend**: Node.js, Express.js  
**Databases**: PostgreSQL, Redis  
**Architecture**: Microservices with API Gateway  

---

Enjoy building! 🎉
