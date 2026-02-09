require('./tracing');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cartRoutes = require('./routes/cart');
const { connectRedis } = require('./config/redis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cart', cartRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

// Connect to Redis and start server
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
