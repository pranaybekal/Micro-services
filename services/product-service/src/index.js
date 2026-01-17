require('./tracing');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const { initDatabase } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// =========================
// Middleware (ORDER MATTERS)
// =========================
app.use(cors());
app.use(express.json({ limit: '1mb' }));   // ✅ prevent request aborted
app.use(express.urlencoded({ extended: true }));

// =========================
// Routes
// =========================
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// =========================
// Health Check
// =========================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

// =========================
// Init DB → Start Server
// =========================
initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {   // ✅ Docker-safe binding
      console.log(`Product Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
