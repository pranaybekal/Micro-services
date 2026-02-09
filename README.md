# 🛍️ E-Commerce Microservices Platform

A complete, production-ready e-commerce platform built with modern microservices architecture.

> **Start Here**: Read [START_HERE.md](START_HERE.md) for a quick introduction and setup guide!

## 📋 Quick Links

| Document | Description |
|----------|-------------|
| [**START_HERE.md**](START_HERE.md) | 👈 **Begin here!** Complete overview and first steps |
| [**QUICKSTART.md**](QUICKSTART.md) | Detailed installation and setup instructions |
| [**PROJECT_SUMMARY.md**](PROJECT_SUMMARY.md) | Full project statistics and overview |
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | System architecture and design patterns |
| [**API_EXAMPLES.md**](API_EXAMPLES.md) | API endpoints and testing examples |
| [**DEPLOYMENT.md**](DEPLOYMENT.md) | Cloud deployment guides (AWS, Azure, GCP) |
| [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md) | Common issues and solutions |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                    http://localhost:5173                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Express)                      │
│                    http://localhost:3000                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬──────────────┐
       │               │               │              │
       ▼               ▼               ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   USER   │   │ PRODUCT  │   │   CART   │   │  ORDER   │
│ SERVICE  │   │ SERVICE  │   │ SERVICE  │   │ SERVICE  │
│  :3001   │   │  :3002   │   │  :3003   │   │  :3004   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                    │
                                                    ▼
                                             ┌──────────┐
                                             │INVENTORY │
                                             │ SERVICE  │
                                             │  :3005   │
                                             └──────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

1. **Clone and install dependencies**
```bash
# Install all services
npm run install:all
```

2. **Setup databases**
```bash
# Create PostgreSQL databases
createdb ecommerce_users
createdb ecommerce_products
createdb ecommerce_orders
createdb ecommerce_inventory
```

3. **Configure environment variables**
```bash
# Copy .env.example to .env in each service folder
# Update database credentials
```

4. **Start services**
```bash
# Development mode
npm run dev:all

# Or use Docker Compose
docker-compose up
```

## 📡 Service Ports

- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- User Service: http://localhost:3001
- Product Service: http://localhost:3002
- Cart Service: http://localhost:3003
- Order Service: http://localhost:3004
- Inventory Service: http://localhost:3005

## 🛠️ Tech Stack

**Frontend**
- React 18
- Vite
- TailwindCSS
- React Router
- Axios
- Zustand (State Management)

**Backend**
- Node.js + Express
- PostgreSQL
- Redis
- JWT Authentication
- bcrypt

## 📦 Features

- ✅ User registration & login
- ✅ Product browsing & search
- ✅ Shopping cart management
- ✅ Order placement (COD)
- ✅ Inventory management
- ✅ Responsive modern UI

## 🔐 Default Admin Credentials

```
Email: admin@ecommerce.com
Password: admin123
```

## 📄 License

MIT
