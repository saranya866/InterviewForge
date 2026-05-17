const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

// ========== HEALTH CHECK ==========
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ error: 'DB connection failed: ' + e.message });
  }
});

// ========== REGISTER ==========
app.post('/api/register', async (req, res) => {
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
    
    // FIXED: Only insert columns that ACTUALLY exist in your table
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, xp, streak) 
       VALUES (?, ?, ?, ?, 50, 1)`,
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
    const [users] = await pool.query(
      'SELECT id, name, email, role, xp, streak, password_hash FROM users WHERE email = ?',
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
    user.level = 'Novice';
    user.questions_answered = 0;
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ========== LEADERBOARD ==========
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT name, email, xp, streak FROM users ORDER BY xp DESC LIMIT 50'
    );
    res.json(rows);
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
    
    // Get current user data
    const [user] = await pool.query('SELECT xp, questions_answered FROM users WHERE id = ?', [req.user.id]);
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate new values
    const newXp = (user[0].xp || 0) + amount;
    const newLevel = getLevel(newXp);
    const newQs = (user[0].questions_answered || 0) + (questions_delta || 0);
    
    // Update database
    await pool.query(
      'UPDATE users SET xp = ?, level = ?, questions_answered = ? WHERE id = ?',
      [newXp, newLevel, newQs, req.user.id]
    );
    
    // Log XP event
    await pool.query(
      'INSERT INTO xp_events (user_id, amount, reason) VALUES (?, ?, ?)',
      [req.user.id, amount, reason || 'practice']
    );
    
    res.json({ xp: newXp, level: newLevel });
    
  } catch (e) {
    console.error('XP endpoint error:', e);
    res.status(500).json({ error: e.message });
  }
});
// Get all questions
app.get('/api/questions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM questions ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get coding problems
app.get('/api/coding', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coding_problems ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get games
app.get('/api/games', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/competitions', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM competitions WHERE status = "live" ORDER BY start_time');
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ========== SECURITY IMPORTS ==========
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // npm install nodemailer
const speakeasy = require('speakeasy');   // npm install speakeasy
const qrcode = require('qrcode');         // npm install qrcode

// ========== SECURITY CONSTANTS ==========
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_EXPIRY_DAYS = 180; // 6 months
const COMMON_PASSWORDS = [
  'password123', '12345678', 'qwerty123', 'admin123', 
  'Test@123456', 'Password@123', 'Aaaa@1234'
];

// ========== PASSWORD VALIDATION FUNCTION ==========
function validatePasswordStrength(password) {
  const errors = [];
  
  // Length check (12+ digits)
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }
  
  // No sequential numbers (123, 234, 345, etc.)
  const sequential = /012|123|234|345|456|567|678|789|890/;
  if (sequential.test(password)) {
    errors.push('Password cannot contain sequential numbers (123, 234, etc.)');
  }
  
  // No repeated characters (aaa, bbb, etc.)
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain repeated characters (aaa, bbb, etc.)');
  }
  
  // Check against common passwords
  const lowerPass = password.toLowerCase();
  if (COMMON_PASSWORDS.some(common => lowerPass.includes(common))) {
    errors.push('Password is too common. Choose a more unique password');
  }
  
  return { valid: errors.length === 0, errors };
}

// ========== MIDDLEWARE: RATE LIMITING ==========
const loginAttempts = new Map(); // Store attempts

function checkRateLimit(email) {
  const now = Date.now();
  const record = loginAttempts.get(email);
  
  if (!record) {
    loginAttempts.set(email, { count: 1, lockUntil: null });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Check if locked
  if (record.lockUntil && now < record.lockUntil) {
    const hoursLeft = Math.ceil((record.lockUntil - now) / (60 * 60 * 1000));
    return { allowed: false, lockUntil: record.lockUntil, hoursLeft };
  }
  
  // Reset if lock expired
  if (record.lockUntil && now >= record.lockUntil) {
    loginAttempts.set(email, { count: 1, lockUntil: null });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Increment failed attempts
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

// ========== PASSWORD EXPIRY CHECK ==========
async function checkPasswordExpiry(userId) {
  const [rows] = await pool.query(
    'SELECT password_last_changed FROM users WHERE id = ?',
    [userId]
  );
  
  if (rows.length === 0) return false;
  
  const lastChanged = new Date(rows[0].password_last_changed);
  const expiryDate = new Date(lastChanged);
  expiryDate.setDate(expiryDate.getDate() + PASSWORD_EXPIRY_DAYS);
  
  return new Date() >= expiryDate;
}

// ========== UPDATE REGISTER ENDPOINT ==========
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }
    
    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.errors[0] });
    }
    
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hash = await bcrypt.hash(password, 12); // Increased salt rounds to 12
    
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, xp, streak, level, 
       password_last_changed, mfa_enabled, mfa_secret, email_verified) 
       VALUES (?, ?, ?, ?, 50, 1, 'Novice', NOW(), 0, NULL, 0)`,
      [name, email.toLowerCase(), hash, role || 'Undergraduate']
    );
    
    // Send verification email (implement with nodemailer)
    await sendVerificationEmail(email, result.insertId);
    
    const user = {
      id: result.insertId,
      name: name,
      email: email.toLowerCase(),
      role: role || 'Undergraduate',
      xp: 50,
      streak: 1,
      level: 'Novice',
      questions_answered: 0,
      mfa_enabled: false
    };
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token, requiresMFA: false });
    
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ========== UPDATE LOGIN ENDPOINT (with rate limiting) ==========
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, mfaCode } = req.body;
    
    // Rate limiting check
    const rateCheck = checkRateLimit(email);
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: `Account locked for ${rateCheck.hoursLeft} hours due to too many failed attempts`,
        lockUntil: rateCheck.lockUntil
      });
    }
    
    const [users] = await pool.query(
      `SELECT id, name, email, role, xp, streak, level, questions_answered, 
       average_score, password_hash, mfa_enabled, mfa_secret, email_verified 
       FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) {
      // Increment failed attempts automatically via checkRateLimit
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Reset rate limit on successful login
    resetRateLimit(email);
    
    // Check if MFA is enabled
    if (users[0].mfa_enabled) {
      if (!mfaCode) {
        return res.status(200).json({ requiresMFA: true, userId: users[0].id });
      }
      
      const verified = speakeasy.totp.verify({
        secret: users[0].mfa_secret,
        encoding: 'base32',
        token: mfaCode
      });
      
      if (!verified) {
        return res.status(401).json({ error: 'Invalid MFA code' });
      }
    }
    
    // Check if email is verified
    if (!users[0].email_verified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }
    
    // Check password expiry
    const passwordExpired = await checkPasswordExpiry(users[0].id);
    if (passwordExpired) {
      return res.status(200).json({ 
        requiresPasswordChange: true,
        message: 'Your password has expired. Please update your password.'
      });
    }
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [users[0].id]);
    
    const { password_hash, mfa_secret, ...user } = users[0];
    user.initial = user.name[0].toUpperCase();
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token, requiresMFA: false });
    
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ========== UPDATE PASSWORD ENDPOINT ==========
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

// ========== FORGOT PASSWORD ENDPOINT ==========
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email.toLowerCase()]);
    if (users.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ success: true, message: 'If your email is registered, you will receive a reset link' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_expiry = ? WHERE id = ?',
      [resetToken, resetExpiry, users[0].id]
    );
    
    // Send reset email (implement with nodemailer)
    await sendResetEmail(email, resetToken, users[0].name);
    
    res.json({ success: true, message: 'If your email is registered, you will receive a reset link' });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== RESET PASSWORD ENDPOINT ==========
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

// ========== MFA SETUP ENDPOINT ==========
app.post('/api/setup-mfa', authenticateToken, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `AceCast:${req.user.email}`,
      issuer: 'AceCast'
    });
    
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    
    await pool.query(
      'UPDATE users SET mfa_secret = ?, mfa_enabled = 1 WHERE id = ?',
      [secret.base32, req.user.id]
    );
    
    res.json({ secret: secret.base32, qrCodeUrl });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== EMAIL FUNCTIONS (implement with nodemailer) ==========
async function sendVerificationEmail(email, userId) {
  // Implementation using nodemailer
  console.log(`Verification email sent to ${email}`);
}

async function sendResetEmail(email, token, name) {
  // Implementation using nodemailer
  console.log(`Reset email sent to ${email} with token: ${token}`);
}
