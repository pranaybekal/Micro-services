// 1️⃣ Load environment variables FIRST
require("dotenv").config();


const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// Initialize database and start server
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
