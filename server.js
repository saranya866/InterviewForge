const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
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

// ========== PASSWORD VALIDATION ==========
function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 12) errors.push('Password must be at least 12 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push('Password must contain at least one special character');
  if (/012|123|234|345|456|567|678|789|890/.test(password)) errors.push('Password cannot contain sequential numbers (123, 234, etc.)');
  if (/(.)\1{2,}/.test(password)) errors.push('Password cannot contain repeated characters (aaa, bbb, etc.)');
  
  return { valid: errors.length === 0, errors };
}

// ========== RATE LIMITING ==========
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 24 * 60 * 60 * 1000;

function checkRateLimit(email) {
  const now = Date.now();
  const record = loginAttempts.get(email);
  
  if (!record) {
    loginAttempts.set(email, { count: 1, lockUntil: null });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  if (record.lockUntil && now < record.lockUntil) {
    const hoursLeft = Math.ceil((record.lockUntil - now) / (60 * 60 * 1000));
    return { allowed: false, lockUntil: record.lockUntil, hoursLeft };
  }
  
  if (record.lockUntil && now >= record.lockUntil) {
    loginAttempts.set(email, { count: 1, lockUntil: null });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  record.count++;
  const allowed = record.count <= MAX_LOGIN_ATTEMPTS;
  
  if (!allowed) {
    record.lockUntil = now + LOCKOUT_DURATION;
    return { allowed: false, lockUntil: record.lockUntil, hoursLeft: 24 };
  }
  
  loginAttempts.set(email, record);
  return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - record.count };
}

function resetRateLimit(email) {
  loginAttempts.delete(email);
}

// ========== PASSWORD EXPIRY ==========
async function checkPasswordExpiry(userId) {
  const [rows] = await pool.query('SELECT password_last_changed FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) return false;
  
  const lastChanged = new Date(rows[0].password_last_changed);
  const expiryDate = new Date(lastChanged);
  expiryDate.setMonth(expiryDate.getMonth() + 6);
  
  return new Date() >= expiryDate;
}

// ========== HELPER FUNCTIONS ==========
function getLevel(xp) {
  if (xp >= 15000) return 'Grandmaster';
  if (xp >= 7500) return 'Master';
  if (xp >= 3500) return 'Expert';
  if (xp >= 1500) return 'Practitioner';
  if (xp >= 500) return 'Apprentice';
  return 'Novice';
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

async function isPasswordBreached(password) {
  try {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const data = await response.text();
    
    return data.includes(suffix);
  } catch (error) {
    console.error('Breach check failed:', error);
    return false;
  }
}

// ========== HEALTH CHECK ==========
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ error: 'DB connection failed: ' + e.message });
  }
});


//===============================================
const https = require('https');

async function isPasswordBreached(password) {
  return new Promise((resolve) => {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);
    
    const options = {
      hostname: 'api.pwnedpasswords.com',
      path: `/range/${prefix}`,
      method: 'GET',
      headers: { 'User-Agent': 'AceCast-App' }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.includes(suffix)));
    });
    
    req.on('error', () => resolve(false));
    req.end();
  });
}
// ========== REGISTER ==========
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }
    
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.errors[0] });
    }

    const isBreached = await isPasswordBreached(password);
    if (isBreached) {
      return res.status(400).json({ error: 'This password has been found in data breaches. Please choose a different password.' });
    }
    
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, xp, streak, level, password_last_changed) 
       VALUES (?, ?, ?, ?, 50, 1, 'Novice', NOW())`,
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
    

if (isBreached) {
  return res.status(400).json({ error: 'This password has been found in data breaches. Please choose a different password.' });
}

    
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
    
    
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: e.message });
  }
});



// ========== LOGIN ==========
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: `Account locked for ${rateCheck.hoursLeft} hours due to too many failed attempts`
      });
    }
    
    const [users] = await pool.query(
      `SELECT id, name, email, role, xp, streak, level, questions_answered, 
       average_score, password_hash, password_last_changed FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    resetRateLimit(email);
    
    const passwordExpired = await checkPasswordExpiry(users[0].id);
    if (passwordExpired) {
      return res.status(200).json({ 
        requiresPasswordChange: true,
        message: 'Your password has expired. Please update your password.'
      });
    }
    
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [users[0].id]);
    
    const { password_hash, ...user } = users[0];
    user.initial = user.name[0].toUpperCase();
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
    
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ========== UPDATE PASSWORD ==========
app.post('/api/update-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const valid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.errors[0] });
    }
    
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = ?, password_last_changed = NOW() WHERE id = ?',
      [hash, req.user.id]
    );
    
    res.json({ success: true, message: 'Password updated successfully' });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== FORGOT PASSWORD ==========
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (users.length === 0) {
      return res.json({ success: true, message: 'If your email is registered, you will receive a reset link' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_expiry = ? WHERE id = ?',
      [resetToken, resetExpiry, users[0].id]
    );
    
    res.json({ success: true, message: 'Password reset link has been sent', resetToken: resetToken });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== RESET PASSWORD ==========
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const [users] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expiry > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.errors[0] });
    }
    
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = ?, password_last_changed = NOW(), reset_token = NULL, reset_expiry = NULL WHERE id = ?',
      [hash, users[0].id]
    );
    
    res.json({ success: true, message: 'Password reset successfully' });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== LEADERBOARD ==========
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT name, email, xp, streak, level FROM users ORDER BY xp DESC LIMIT 50'
    );
    const data = rows.map((r, idx) => ({
      ...r,
      rank: idx + 1,
      initial: r.name[0].toUpperCase()
    }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== ADD XP ==========
app.post('/api/xp', authenticateToken, async (req, res) => {
  try {
    const { amount, reason, questions_delta } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid XP amount' });
    }
    
    const [user] = await pool.query('SELECT xp, questions_answered FROM users WHERE id = ?', [req.user.id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newXp = (user[0].xp || 0) + amount;
    const newLevel = getLevel(newXp);
    const newQs = (user[0].questions_answered || 0) + (questions_delta || 0);
    
    await pool.query(
      'UPDATE users SET xp = ?, level = ?, questions_answered = ? WHERE id = ?',
      [newXp, newLevel, newQs, req.user.id]
    );
    
    await pool.query(
      'INSERT INTO xp_events (user_id, amount, reason) VALUES (?, ?, ?)',
      [req.user.id, amount, reason || 'practice']
    );
    
    res.json({ xp: newXp, level: newLevel });
    
  } catch (e) {
    console.error('XP error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ========== GET QUESTIONS ==========
app.get('/api/questions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== GET CODING PROBLEMS ==========
app.get('/api/coding', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coding_problems ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== GET GAMES ==========
app.get('/api/games', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== GET COMPETITIONS ==========
app.get('/api/competitions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM competitions WHERE status = "live" ORDER BY start_time');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
