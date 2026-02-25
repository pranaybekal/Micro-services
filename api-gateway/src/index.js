const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// MIDDLEWARE
// =========================
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
};

app.use(cors(corsOptions));
// Morgan HTTP request logger
app.use(morgan(':method :url :status :response-time ms'));

// ⚠️ IMPORTANT:
// ❌ DO NOT USE express.json() IN A PROXY GATEWAY
// ❌ DO NOT READ REQUEST BODY

app.options('*', cors(corsOptions));

// =========================
// GLOBAL REQUEST LOGGER (SAFE)
// =========================
app.use((req, res, next) => {
  const start = Date.now();

  console.log(`\n➡️  [REQUEST] ${req.method} ${req.originalUrl}`);
  console.log(`   IP: ${req.ip}`);

  res.on('finish', () => {
    const time = Date.now() - start;
    console.log(`⬅️  [RESPONSE] ${req.method} ${req.originalUrl}`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Time: ${time}ms\n`);
  });

  next();
});

// =========================
// SERVICE URLS (Docker DNS)
// =========================
const services = {
  user: 'http://user-service:3001',
  product: 'http://product-service:3002',
  cart: 'http://cart-service:3003',
  order: 'http://order-service:3004',
  inventory: 'http://inventory-service:3005',
};

// =========================
// HEALTH CHECK
// =========================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    services,
  });
});

// =========================
// PROXY HELPER (STREAMING SAFE)
// =========================
const proxyWithLogs = (serviceName, target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,

    onProxyReq: (proxyReq, req) => {
      console.log(
        `🔀 [PROXY → ${serviceName}] ${req.method} ${req.originalUrl}`
      );
      // ✅ Let the stream pass naturally
    },

    onProxyRes: (proxyRes, req) => {
      console.log(
        `✅ [${serviceName} RESPONSE] ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`
      );
    },

    onError: (err, req, res) => {
      console.error(`❌ [${serviceName} ERROR]`);
      console.error(`   URL: ${req.method} ${req.originalUrl}`);
      console.error(`   Message: ${err.message}`);

      if (!res.headersSent) {
        res.status(503).json({
          error: `${serviceName} service unavailable`,
          details: err.message,
        });
      }
    },
  });

// =========================
// ROUTE PROXIES
// =========================
app.use('/api/auth', proxyWithLogs('USER', services.user));
app.use('/api/users', proxyWithLogs('USER', services.user));

app.use('/api/products', proxyWithLogs('PRODUCT', services.product));
app.use('/api/categories', proxyWithLogs('PRODUCT', services.product));

app.use('/api/cart', proxyWithLogs('CART', services.cart));
app.use('/api/orders', proxyWithLogs('ORDER', services.order));
app.use('/api/inventory', proxyWithLogs('INVENTORY', services.inventory));

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  console.warn(`⚠️  [404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('Service endpoints:');
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
});
