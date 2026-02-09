const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER UNIQUE NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_inventory_product_id
      ON inventory(product_id);

      -- 🔥 Auto-update updated_at on row changes
      CREATE OR REPLACE FUNCTION update_inventory_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_inventory_updated_at ON inventory;

      CREATE TRIGGER trg_inventory_updated_at
      BEFORE UPDATE ON inventory
      FOR EACH ROW
      EXECUTE FUNCTION update_inventory_timestamp();
    `);

    console.log('Inventory database initialized successfully');
  } finally {
    client.release();
  }
};

module.exports = { pool, initDatabase };
