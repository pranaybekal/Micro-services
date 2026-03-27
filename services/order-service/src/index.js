require('./tracing');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/orders');
const { initDatabase } = require('./config/database');

const client = require('prom-client');   // ✅ ADD THIS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// ✅ Collect default metrics
client.collectDefaultMetrics();

// Optional: request counter (🔥 recommended)
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP Requests',
});

app.use((req, res, next) => {
  httpRequestCounter.inc();
  next();
});

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

// ✅ METRICS ENDPOINT (IMPORTANT)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Start server AFTER DB ready
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Order Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });