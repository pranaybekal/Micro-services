'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { metrics } = require('@opentelemetry/api'); // ✅ logs removed

const client = require('prom-client');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

const logger = console; // ✅ FIX

// -------------------- Prometheus Metrics --------------------
client.collectDefaultMetrics();

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());

// -------------------- OTEL Metrics --------------------
const meter = metrics.getMeter(
  process.env.OTEL_SERVICE_NAME || 'user-service'
);

const httpRequestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});

// -------------------- Prometheus Counter --------------------
const promRequestCounter = new client.Counter({
  name: 'http_requests_total_prom',
  help: 'Total HTTP Requests (Prometheus)',
});

// -------------------- Middleware --------------------
app.use((req, res, next) => {
  res.on('finish', () => {
    // OTEL metric
    httpRequestCounter.add(1, {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });

    // Prometheus metric
    promRequestCounter.inc();

    // ✅ simple log
    logger.log('HTTP request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
    });
  });
  next();
});

// -------------------- Routes --------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// -------------------- Health --------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// -------------------- METRICS --------------------
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// -------------------- Start --------------------
initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {   // ✅ Docker-safe
      logger.log(`User service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Database initialization failed', err);
    process.exit(1);
  });