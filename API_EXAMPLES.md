# 🧪 API Testing Examples

Use these examples to test the API endpoints with tools like Postman, Insomnia, or curl.

## Base URL
```
http://localhost:3000
```

---

## 🔐 Authentication

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 User Profile

### Get Profile
```bash
GET /api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Profile
```bash
PUT /api/users/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1987654321"
}
```

### Get Addresses
```bash
GET /api/users/addresses
Authorization: Bearer YOUR_TOKEN_HERE
```

### Add Address
```bash
POST /api/users/addresses
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "is_default": true
}
```

---

## 📦 Products

### Get All Products
```bash
GET /api/products
```

### Get Products with Filters
```bash
GET /api/products?category=1&search=laptop&page=1&limit=12
```

### Get Single Product
```bash
GET /api/products/1
```

### Get Categories
```bash
GET /api/categories
```

---

## 🛒 Shopping Cart

### Get Cart
```bash
GET /api/cart/1
# Replace 1 with actual user ID
```

### Add Item to Cart
```bash
POST /api/cart/1/items
Content-Type: application/json

{
  "productId": 5,
  "quantity": 2
}
```

### Update Item Quantity
```bash
PUT /api/cart/1/items/5
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove Item
```bash
DELETE /api/cart/1/items/5
```

### Clear Cart
```bash
DELETE /api/cart/1
```

---

## 📋 Orders

### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "userId": 1,
  "shippingAddress": {
    "address_line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "USA"
  },
  "notes": "Please deliver before 5 PM"
}
```

### Get User Orders
```bash
GET /api/orders/user/1
```

### Get Order Details
```bash
GET /api/orders/1
```

### Update Order Status (Admin)
```bash
PUT /api/orders/1/status
Content-Type: application/json

{
  "status": "shipped"
}
```

**Valid statuses:** `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

---

## 📊 Inventory Management

### Get All Inventory
```bash
GET /api/inventory
```

### Get Inventory for Product
```bash
GET /api/inventory/1
```

### Add Product with Inventory
```bash
POST /api/inventory/add-product
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with 6 buttons",
  "price": 29.99,
  "category_id": 1,
  "image_url": "https://example.com/mouse.jpg",
  "quantity": 50
}
```

### Update Inventory Quantity
```bash
PUT /api/inventory/1
Content-Type: application/json

{
  "quantity": 75
}
```

### Get Low Stock Alerts
```bash
GET /api/inventory/alerts/low-stock
```

---

## 🔍 Example Workflow

### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login and save token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 2. Browse Products
```bash
curl http://localhost:3000/api/products
```

### 3. Add to Cart
```bash
curl -X POST http://localhost:3000/api/cart/1/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

### 4. Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": 1,
    "shippingAddress": {
      "address_line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "USA"
    }
  }'
```

---

## 🎯 Sample Product Data

Here's some sample data you can use to populate your inventory:

```json
[
  {
    "name": "Wireless Bluetooth Headphones",
    "description": "Premium noise-cancelling headphones with 30-hour battery life",
    "price": 149.99,
    "category_id": 1,
    "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "quantity": 50
  },
  {
    "name": "Smart Watch Pro",
    "description": "Advanced fitness tracking with heart rate monitor",
    "price": 299.99,
    "category_id": 1,
    "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "quantity": 30
  },
  {
    "name": "Cotton T-Shirt",
    "description": "Comfortable 100% cotton t-shirt in various colors",
    "price": 19.99,
    "category_id": 2,
    "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "quantity": 100
  },
  {
    "name": "Running Shoes",
    "description": "Lightweight running shoes with excellent cushioning",
    "price": 89.99,
    "category_id": 5,
    "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "quantity": 45
  }
]
```

---

## 📝 Notes

- All authenticated endpoints require the `Authorization: Bearer TOKEN` header
- User IDs should be obtained from the login response
- Product IDs are auto-generated when products are created
- Cart operations use the user ID from the authenticated user
- Order creation automatically clears the cart

---

Happy testing! 🚀
