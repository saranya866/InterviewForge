const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection - FIXED credentials
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mysql',  // ← LEAVE EMPTY if no password
  database: 'interviewforge',
  waitForConnections: true,
  connectionLimit: 10,
});

const JWT_SECRET = 'super_secret_key_2026';

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
  console.log('📝 Register request received:', req.body);
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
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, xp, streak, level) VALUES (?, ?, ?, ?, 50, 1, "Novice")',
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
      questions_answered: 0
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
  console.log('🔐 Login request received:', req.body.email);
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      'SELECT id, name, email, role, xp, streak, level, questions_answered, password_hash FROM users WHERE email = ?',
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
      'SELECT name, email, xp, streak, level FROM users ORDER BY xp DESC LIMIT 50'
    );
    res.json(rows);
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Test health: http://localhost:${PORT}/api/health\n`);
});