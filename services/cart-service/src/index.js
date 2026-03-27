require('./tracing');

const express = require('express');
const app = express();   // ✅ MUST be before routes

const cors = require('cors');
const dotenv = require('dotenv');
const cartRoutes = require('./routes/cart');
const { connectRedis } = require('./config/redis');

const client = require('prom-client');

dotenv.config();

// ✅ metrics
client.collectDefaultMetrics();

app.use(cors());
app.use(express.json());

app.use('/api/cart', cartRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

// ✅ metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const PORT = process.env.PORT || 3003;

connectRedis()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Cart Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  });