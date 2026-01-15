const express = require('express');
const axios = require('axios');
const { pool } = require('../config/database');

const router = express.Router();

// ================= SERVICE URLS =================
const CART_SERVICE_URL =
  process.env.CART_SERVICE_URL || 'http://cart-service:3003';

const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

const INVENTORY_SERVICE_URL =
  process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005';

// ================= CREATE ORDER =================
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    console.log('📥 Incoming order request body:', req.body);

    const { userId, shippingAddress, notes } = req.body;

    if (!userId || !shippingAddress) {
      console.error('❌ Missing userId or shippingAddress');
      return res.status(400).json({
        error: 'Missing required fields (userId, shippingAddress)',
      });
    }

    // ---------- FETCH CART ----------
    console.log(`🛒 Fetching cart for userId=${userId}`);
    const cartResponse = await axios.get(
      `${CART_SERVICE_URL}/api/cart/${userId}`
    );

    console.log('🛒 Cart service response:', cartResponse.data);

    const { items } = cartResponse.data;

    if (!items || items.length === 0) {
      console.error('❌ Cart is empty or items missing');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    console.log(`🛒 Cart has ${items.length} items`);

    await client.query('BEGIN');
    console.log('🟢 DB transaction started');

    // ---------- CREATE ORDER ----------
    const orderResult = await client.query(
      `
      INSERT INTO orders
      (user_id, total_amount, payment_method, shipping_address, notes)
      VALUES ($1, 0, 'cod', $2, $3)
      RETURNING *
      `,
      [userId, JSON.stringify(shippingAddress), notes || null]
    );

    const order = orderResult.rows[0];
    console.log('📦 Order created:', order);

    let orderTotal = 0;

    // ---------- PROCESS CART ITEMS ----------
    for (const item of items) {
      console.log('➡️ Processing cart item:', item);

      if (!item.productId || !item.quantity) {
        console.error('❌ Invalid cart item structure:', item);
        throw new Error('Invalid cart item');
      }

      console.log(`📦 Fetching product ${item.productId}`);
      const productResponse = await axios.get(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`
      );

      console.log('📦 Product response:', productResponse.data);

      const product = productResponse.data;

      if (!product || !product.id) {
        console.error('❌ Product not found:', item.productId);
        throw new Error(`Invalid product ${item.productId}`);
      }

      const price = Number(product.price);
      if (Number.isNaN(price)) {
        console.error('❌ Invalid product price:', product.price);
        throw new Error(`Invalid price for product ${item.productId}`);
      }

      const subtotal = price * item.quantity;
      orderTotal += subtotal;

      console.log(
        `💰 Adding item: product=${product.id}, qty=${item.quantity}, subtotal=${subtotal}`
      );

      await client.query(
        `
        INSERT INTO order_items
        (order_id, product_id, product_name, product_price, quantity, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          order.id,
          product.id,
          product.name,
          price,
          item.quantity,
          subtotal,
        ]
      );

      console.log(`📉 Reducing inventory for product ${item.productId}`);
      await axios.put(
        `${INVENTORY_SERVICE_URL}/api/inventory/${item.productId}/reduce`,
        { quantity: item.quantity }
      );
    }

    await client.query(
      `UPDATE orders SET total_amount = $1 WHERE id = $2`,
      [orderTotal, order.id]
    );

    console.log('💾 Order total updated:', orderTotal);

    await client.query('COMMIT');
    console.log('✅ DB transaction committed');

    console.log(`🧹 Clearing cart for user ${userId}`);
    await axios.delete(`${CART_SERVICE_URL}/api/cart/${userId}`);

    const completeOrder = await getOrderById(order.id);
    console.log('🎉 Order completed:', completeOrder);

    res.status(201).json(completeOrder);

  } catch (error) {
    await client.query('ROLLBACK');

    console.error('🔥 CREATE ORDER ERROR');
    console.error('Message:', error.message);
    console.error('Axios status:', error.response?.status);
    console.error('Axios data:', error.response?.data);

    res.status(400).json({ error: error.message });
  } finally {
    client.release();
    console.log('🔒 DB client released');
  }
});


// ================= GET ORDERS BY USER =================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`📦 Fetching orders for user ${userId}`);

    const result = await pool.query(
      `
      SELECT o.*,
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
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


// ================= GET ORDER BY ID =================
async function getOrderById(orderId) {
  const result = await pool.query(
    `
    SELECT o.*,
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
    GROUP BY o.id
    `,
    [orderId]
  );

  return result.rows[0] || null;
}

module.exports = router;
