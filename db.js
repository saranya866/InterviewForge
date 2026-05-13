require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});

pool.connect()
  .then(client => {
    console.log('✅ Neon PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Neon PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;