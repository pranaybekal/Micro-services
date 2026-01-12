const express = require('express');
const axios = require('axios');
const { pool } = require('../config/database');

const router = express.Router();

// Docker-safe service URLs
const CART_SERVICE_URL =
  process.env.CART_SERVICE_URL || 'http://cart-service:3003';

const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

// ================= CREATE ORDER =================
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const { userId, shippingAddress, notes } = req.body;

    if (!userId || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch cart
    const cartResponse = await axios.get(
      `${CART_SERVICE_URL}/api/cart/${userId}`
    );

    const { items } = cartResponse.data;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    await client.query('BEGIN');

    // Create order with temp total
    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, total_amount, payment_method, shipping_address, notes)
       VALUES ($1, 0, 'cod', $2, $3)
       RETURNING *`,
      [userId, JSON.stringify(shippingAddress), notes || null]
    );

    const order = orderResult.rows[0];
    let orderTotal = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        throw new Error('Invalid cart item');
      }

      // Fetch product from product-service
      const productResponse = await axios.get(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`
      );

      const product = productResponse.data;

      // ✅ CRITICAL FIX
      const price = Number(product.price);

      if (!product || isNaN(price)) {
        throw new Error(`Invalid product ${item.productId}`);
      }

      const subtotal = price * item.quantity;
      orderTotal += subtotal;

      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          product.id,
          product.name,
          price,
          item.quantity,
          subtotal
        ]
      );

      // Reduce inventory
      await axios.put(
        `${INVENTORY_SERVICE_URL}/api/inventory/${item.productId}/reduce`,
        { quantity: item.quantity }
      );
    }

    // Update final total
    await client.query(
      `UPDATE orders SET total_amount = $1 WHERE id = $2`,
      [orderTotal, order.id]
    );

    await client.query('COMMIT');

    // Clear cart
    await axios.delete(`${CART_SERVICE_URL}/api/cart/${userId}`);

    const completeOrder = await getOrderById(order.id);
    res.status(201).json(completeOrder);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ================= HELPERS =================
async function getOrderById(orderId) {
  const result = await pool.query(
    `SELECT o.*,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'product_name', oi.product_name,
                  'product_price', oi.product_price,
                  'quantity', oi.quantity,
                  'subtotal', oi.subtotal
                )
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'
            ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.id = $1
     GROUP BY o.id`,
    [orderId]
  );

  return result.rows[0] || null;
}

module.exports = router;
