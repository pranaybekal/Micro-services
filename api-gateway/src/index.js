const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const client = require('prom-client'); // ✅ Prometheus

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// PROMETHEUS SETUP
// =========================
client.collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: 'api_gateway_requests_total',
  help: 'Total API Gateway Requests',
  labelNames: ['method', 'route', 'status'],
});

// =========================
// CORS
// =========================
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// =========================
// REQUEST LOGGER + METRICS
// =========================
app.use((req, res, next) => {
  const start = Date.now();

  console.log(`\n➡️  [REQUEST] ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const time = Date.now() - start;

    // ✅ Prometheus metric
    httpRequestCounter.inc({
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
    });

    console.log(`⬅️  [RESPONSE] ${req.method} ${req.originalUrl}`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Time: ${time}ms\n`);
  });

  next();
});

// =========================
// SERVICE URLS
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
// METRICS ENDPOINT
// =========================
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// =========================
// PROXY HELPER
// =========================
const proxyWithLogs = (serviceName, target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,

    onProxyReq: (proxyReq, req) => {
      console.log(`🔀 [PROXY → ${serviceName}] ${req.method} ${req.originalUrl}`);
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
// ROUTES
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