const express = require('express');
const axios = require('axios');
const { getRedisClient } = require('../config/redis');

const router = express.Router();

// =========================
// Service URLs (Docker-safe)
// =========================
const PRODUCT_SERVICE_URL =
  process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';

const CART_SERVICE_URL =
  process.env.CART_SERVICE_URL || 'http://cart-service:3003';

// =========================
// Get cart
// =========================
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const redis = getRedisClient();

    const cartData = await redis.get(`cart:${userId}`);

    if (!cartData) {
      return res.json({ items: [], total: 0 });
    }

    const cart = JSON.parse(cartData);

    // Fetch product details
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const response = await axios.get(
            `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`
          );
          return {
            ...item,
            product: response.data
          };
        } catch (error) {
          console.error(
            `Failed to fetch product ${item.productId}:`,
            error.message
          );
          return { ...item, product: null };
        }
      })
    );

    const total = itemsWithDetails.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    res.json({ items: itemsWithDetails, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =========================
// Add item to cart
// =========================
router.post('/:userId/items', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body;

    const redis = getRedisClient();

    let cart = { items: [] };
    const cartData = await redis.get(`cart:${userId}`);
    if (cartData) {
      cart = JSON.parse(cartData);
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await redis.set(`cart:${userId}`, JSON.stringify(cart), {
      EX: 60 * 60 * 24 * 7
    });

    // Fetch updated cart using service name
    const response = await axios.get(
      `${CART_SERVICE_URL}/api/cart/${userId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =========================
// Update cart item
// =========================
router.put('/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res
        .status(400)
        .json({ error: 'Quantity must be at least 1' });
    }

    const redis = getRedisClient();
    const cartData = await redis.get(`cart:${userId}`);

    if (!cartData) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cart = JSON.parse(cartData);
    const item = cart.items.find(
      (i) => i.productId === parseInt(productId)
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;

    await redis.set(`cart:${userId}`, JSON.stringify(cart), {
      EX: 60 * 60 * 24 * 7
    });

    const response = await axios.get(
      `${CART_SERVICE_URL}/api/cart/${userId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =========================
// Remove item
// =========================
router.delete('/:userId/items/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const redis = getRedisClient();
    const cartData = await redis.get(`cart:${userId}`);

    if (!cartData) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cart = JSON.parse(cartData);
    cart.items = cart.items.filter(
      (item) => item.productId !== parseInt(productId)
    );

    await redis.set(`cart:${userId}`, JSON.stringify(cart), {
      EX: 60 * 60 * 24 * 7
    });

    const response = await axios.get(
      `${CART_SERVICE_URL}/api/cart/${userId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// =========================
// Clear cart
// =========================
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const redis = getRedisClient();

    await redis.del(`cart:${userId}`);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
