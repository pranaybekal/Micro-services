require('./tracing');

// 1️⃣ Load environment variables FIRST
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const { metrics } = require('@opentelemetry/api');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// Metrics (HTTP requests)
// =========================
const meter = metrics.getMeter(process.env.OTEL_SERVICE_NAME || 'user-service');

const httpRequestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.add(1, {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
      service: process.env.OTEL_SERVICE_NAME || 'user-service',
    });
  });
  next();
});

// =========================
// Routes
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// =========================
// Health check
// =========================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// =========================
// Initialize database and start server
// =========================
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`User Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
