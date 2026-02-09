# 🏗️ Project Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    React + Vite + Tailwind                   │
│                    http://localhost:5173                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│                  Express.js + Proxy                          │
│                  http://localhost:3000                       │
│          (Routes requests to microservices)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬───────────────┐
       │               │               │               │
       ▼               ▼               ▼               ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   USER   │   │ PRODUCT  │   │   CART   │   │  ORDER   │
│ SERVICE  │   │ SERVICE  │   │ SERVICE  │   │ SERVICE  │
│  :3001   │   │  :3002   │   │  :3003   │   │  :3004   │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │              │
     │              │              │              │
     ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│PostgreSQL│   │PostgreSQL│   │  Redis   │   │PostgreSQL│
│  users   │   │ products │   │  cache   │   │  orders  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                     │                              │
                     │                              │
                     ▼                              ▼
              ┌──────────┐                   ┌──────────┐
              │INVENTORY │                   │PostgreSQL│
              │ SERVICE  │                   │inventory │
              │  :3005   │───────────────────►          │
              └──────────┘                   └──────────┘
```

---

## Microservices Breakdown

### 1. Frontend (React Application)
**Port**: 5173  
**Tech Stack**: React 18, Vite, TailwindCSS, Zustand, React Router

**Features**:
- User authentication (Login/Register)
- Product browsing and search
- Shopping cart management
- Checkout process
- Order history
- Inventory management dashboard (Admin)

**Key Components**:
- `Navbar` - Navigation with cart badge
- `Home` - Landing page
- `Products` - Product listing with filters
- `ProductDetail` - Single product view
- `Cart` - Shopping cart
- `Checkout` - Order placement
- `Orders` - Order history
- `InventoryDashboard` - Admin product management

---

### 2. API Gateway
**Port**: 3000  
**Tech Stack**: Express.js, http-proxy-middleware

**Responsibilities**:
- Single entry point for all client requests
- Request routing to appropriate microservices
- CORS handling
- Error handling and service availability checking

**Routes**:
- `/api/auth/*` → User Service
- `/api/users/*` → User Service
- `/api/products/*` → Product Service
- `/api/categories/*` → Product Service
- `/api/cart/*` → Cart Service
- `/api/orders/*` → Order Service
- `/api/inventory/*` → Inventory Service

---

### 3. User Service
**Port**: 3001  
**Tech Stack**: Express.js, PostgreSQL, JWT, bcrypt

**Database**: `ecommerce_users`

**Tables**:
- `users` - User accounts with authentication
- `addresses` - User shipping addresses

**Endpoints**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/addresses` - Get addresses
- `POST /api/users/addresses` - Add address

**Security**:
- Password hashing with bcrypt
- JWT token generation
- Authentication middleware

---

### 4. Product Service
**Port**: 3002  
**Tech Stack**: Express.js, PostgreSQL

**Database**: `ecommerce_products`

**Tables**:
- `categories` - Product categories
- `products` - Product catalog

**Endpoints**:
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - List categories

**Features**:
- Search and filtering
- Pagination
- Category management
- Product CRUD operations

---

### 5. Cart Service
**Port**: 3003  
**Tech Stack**: Express.js, Redis, Axios

**Data Store**: Redis (for fast access and session management)

**Endpoints**:
- `GET /api/cart/:userId` - Get cart with product details
- `POST /api/cart/:userId/items` - Add item to cart
- `PUT /api/cart/:userId/items/:productId` - Update quantity
- `DELETE /api/cart/:userId/items/:productId` - Remove item
- `DELETE /api/cart/:userId` - Clear cart

**Features**:
- Real-time cart updates
- Product enrichment (fetches from Product Service)
- Session persistence (7-day expiry)
- Total calculation

---

### 6. Order Service
**Port**: 3004  
**Tech Stack**: Express.js, PostgreSQL, Axios

**Database**: `ecommerce_orders`

**Tables**:
- `orders` - Order records
- `order_items` - Order line items

**Endpoints**:
- `POST /api/orders` - Create order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

**Features**:
- COD (Cash on Delivery) payment
- Order creation with transaction support
- Automatic cart clearing after order
- Inventory integration
- Order status tracking

**Order Statuses**:
- `pending` - Order placed
- `confirmed` - Order confirmed
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

---

### 7. Inventory Service
**Port**: 3005  
**Tech Stack**: Express.js, PostgreSQL, Axios

**Database**: `ecommerce_inventory`

**Tables**:
- `inventory` - Stock levels for products

**Endpoints**:
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/:productId` - Get product inventory
- `POST /api/inventory/add-product` - Add product with stock
- `PUT /api/inventory/:productId` - Update stock level
- `PUT /api/inventory/:productId/reduce` - Reduce stock (for orders)
- `GET /api/inventory/alerts/low-stock` - Low stock alerts

**Features**:
- Stock management
- Low stock alerts
- Product creation with inventory
- Integration with Product Service and Order Service

---

## Data Flow Examples

### User Registration Flow
```
1. User fills registration form → Frontend
2. POST /api/auth/register → API Gateway
3. Route to User Service → User Service
4. Hash password, save to DB → PostgreSQL
5. Generate JWT token → User Service
6. Return user + token → Frontend
7. Store token in localStorage → Frontend
```

### Product Purchase Flow
```
1. User adds product to cart → Frontend
2. POST /api/cart/:userId/items → API Gateway
3. Route to Cart Service → Cart Service
4. Save to Redis, fetch product details → Redis + Product Service
5. Return updated cart → Frontend

6. User proceeds to checkout → Frontend
7. POST /api/orders → API Gateway
8. Route to Order Service → Order Service
9. Get cart items → Cart Service
10. Create order transaction → PostgreSQL
11. Reduce inventory → Inventory Service
12. Clear cart → Cart Service
13. Return order confirmation → Frontend
```

### Product Search Flow
```
1. User enters search term → Frontend
2. GET /api/products?search=laptop → API Gateway
3. Route to Product Service → Product Service
4. Query database with filters → PostgreSQL
5. Return paginated results → Frontend
6. Display products → Frontend
```

---

## Database Schemas

### User Service (ecommerce_users)

**users**
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL
first_name      VARCHAR(100) NOT NULL
last_name       VARCHAR(100) NOT NULL
phone           VARCHAR(20)
role            VARCHAR(20) DEFAULT 'customer'
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**addresses**
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id)
address_line1   VARCHAR(255) NOT NULL
address_line2   VARCHAR(255)
city            VARCHAR(100) NOT NULL
state           VARCHAR(100) NOT NULL
postal_code     VARCHAR(20) NOT NULL
country         VARCHAR(100) NOT NULL
is_default      BOOLEAN DEFAULT false
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Product Service (ecommerce_products)

**categories**
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(100) UNIQUE NOT NULL
description     TEXT
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**products**
```sql
id              SERIAL PRIMARY KEY
name            VARCHAR(255) NOT NULL
description     TEXT
price           DECIMAL(10, 2) NOT NULL
category_id     INTEGER REFERENCES categories(id)
image_url       TEXT
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Order Service (ecommerce_orders)

**orders**
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER NOT NULL
total_amount    DECIMAL(10, 2) NOT NULL
status          VARCHAR(50) DEFAULT 'pending'
payment_method  VARCHAR(50) DEFAULT 'cod'
shipping_address TEXT NOT NULL
notes           TEXT
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**order_items**
```sql
id              SERIAL PRIMARY KEY
order_id        INTEGER REFERENCES orders(id)
product_id      INTEGER NOT NULL
product_name    VARCHAR(255) NOT NULL
product_price   DECIMAL(10, 2) NOT NULL
quantity        INTEGER NOT NULL
subtotal        DECIMAL(10, 2) NOT NULL
```

### Inventory Service (ecommerce_inventory)

**inventory**
```sql
id                  SERIAL PRIMARY KEY
product_id          INTEGER UNIQUE NOT NULL
quantity            INTEGER NOT NULL DEFAULT 0
low_stock_threshold INTEGER DEFAULT 10
created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS |
| **State Management** | Zustand |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Backend Framework** | Express.js |
| **API Gateway** | http-proxy-middleware |
| **Databases** | PostgreSQL 14+ |
| **Cache/Session** | Redis 7+ |
| **Authentication** | JWT, bcrypt |
| **Containerization** | Docker, Docker Compose |

---

## Cloud Deployment Benefits

This architecture supports:

✅ **Independent Scaling**: Scale services based on load  
✅ **Independent Deployment**: Deploy services without affecting others  
✅ **Fault Isolation**: Service failures don't crash entire system  
✅ **Technology Flexibility**: Use different tech per service  
✅ **Team Autonomy**: Different teams can own different services  
✅ **Easy Monitoring**: Monitor each service independently  

---

## Security Considerations

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)

---

This architecture provides a solid foundation for a production-ready e-commerce platform! 🚀
