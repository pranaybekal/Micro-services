require('./tracing');


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/orders');
const { initDatabase } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
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
