const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
});

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me';

// ========== HEALTH CHECK ==========
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', message: 'Backend is running!' });
  } catch (e) {
    res.status(500).json({ error: 'DB connection failed: ' + e.message });
  }
});

// ========== REGISTER ==========
app.post('/api/register', async (req, res) => {
  console.log('📝 Register request:', req.body.email);
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }
    
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    // Updated INSERT to match all required columns
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, xp, streak, questions_answered, average_score, level) VALUES (?, ?, ?, ?, 50, 1, 0, 0.00, "Novice")',
      [name, email.toLowerCase(), hash, role || 'Undergraduate']
    );
    
    const user = {
      id: result.insertId,
      name: name,
      email: email.toLowerCase(),
      role: role || 'Undergraduate',
      xp: 50,
      streak: 1,
      level: 'Novice',
      questions_answered: 0,
      average_score: 0.00
    };
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ User registered:', user.email);
    res.json({ user, token });
  } catch (e) {
    console.error('❌ Register error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ========== LOGIN ==========
app.post('/api/login', async (req, res) => {
  console.log('🔐 Login request:', req.body.email);
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      'SELECT id, name, email, role, xp, streak, level, questions_answered, average_score, password_hash FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { password_hash, ...user } = users[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ User logged in:', user.email);
    res.json({ user, token });
  } catch (e) {
    console.error('❌ Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ========== LEADERBOARD ==========
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT name, email, xp, streak, level, questions_answered FROM users ORDER BY xp DESC LIMIT 50'
    );
    const data = rows.map((r, idx) => ({
      ...r,
      rank: idx + 1,
      initial: r.name[0].toUpperCase(),
      studentType: r.level,
      questions: r.questions_answered
    }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== ADD XP ==========
app.post('/api/xp', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    await pool.query('UPDATE users SET xp = xp + ? WHERE id = ?', [amount, userId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
