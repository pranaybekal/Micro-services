const express = require('express');
const axios = require('axios');
const { pool } = require('../config/database');

const router = express.Router();

// Docker-safe product service URL
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';


// =====================================================
// INIT INVENTORY (🔥 THIS WAS MISSING 🔥)
// =====================================================
router.post('/init', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || quantity == null) {
      return res.status(400).json({ error: 'product_id and quantity required' });
    }

    const result = await pool.query(
      `
      INSERT INTO inventory (product_id, quantity)
      VALUES ($1, $2)
      ON CONFLICT (product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity
      RETURNING *
      `,
      [product_id, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Inventory init error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// =====================================================
// CREATE PRODUCT + INVENTORY (ADMIN FLOW)
// =====================================================
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name,
      description,
      price,
      category_id,
      image_url,
      quantity = 0
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await client.query('BEGIN');

    // 1️⃣ Create product
    const productResponse = await axios.post(
      `${PRODUCT_SERVICE_URL}/api/products`,
      {
        name,
        description,
        price: Number(price),
        category_id,
        image_url
      }
    );

    const product = productResponse.data;

    // 2️⃣ Create inventory
    const inventoryResult = await client.query(
      `
      INSERT INTO inventory (product_id, quantity)
      VALUES ($1, $2)
      RETURNING *
      `,
      [product.id, quantity]
    );

    await client.query('COMMIT');

    res.status(201).json({
      product,
      inventory: inventoryResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add product error:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});


// =====================================================
// REDUCE INVENTORY (ORDER FLOW)
// =====================================================
router.put('/:productId/reduce', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const result = await pool.query(
      `
      UPDATE inventory
      SET quantity = quantity - $1
      WHERE product_id = $2 AND quantity >= $1
      RETURNING *
      `,
      [quantity, productId]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        error: 'Insufficient inventory or inventory not initialized'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Reduce inventory error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// =====================================================
// GET INVENTORY
// =====================================================
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      `SELECT * FROM inventory WHERE product_id = $1`,
      [productId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get inventory error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
