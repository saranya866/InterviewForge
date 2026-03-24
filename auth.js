// routes/auth.js — /api/auth/*
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');

const router      = express.Router();
const SALT_ROUNDS = 12;

// ── helpers ──────────────────────────────────────────────
function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

function computeLevel(xp) {
  if (xp >= 15000) return 'Grandmaster';
  if (xp >= 7500)  return 'Master';
  if (xp >= 3500)  return 'Expert';
  if (xp >= 1500)  return 'Practitioner';
  if (xp >= 500)   return 'Apprentice';
  return 'Novice';
}

// ── POST /api/auth/register ───────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const emailLC = email.toLowerCase().trim();

    // Duplicate check
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [emailLC]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, xp)
       VALUES (?, ?, ?, ?, 50)`,
      [name.trim(), emailLC, password_hash, role || 'Undergraduate']
    );

    const [[user]] = await db.query(
      'SELECT * FROM users WHERE id = ?', [result.insertId]
    );

    return res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const [[user]] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ── Streak logic ─────────────────────────────────────
    const today     = new Date().toISOString().slice(0, 10);
    const lastActive = user.last_active
      ? user.last_active.toISOString().slice(0, 10)
      : null;

    let streak = user.streak || 0;
    if (lastActive) {
      const diff = Math.floor(
        (new Date(today) - new Date(lastActive)) / 86_400_000
      );
      if (diff === 1)     streak += 1;
      else if (diff > 1)  streak  = 1;
      // diff === 0 → same day, keep streak unchanged
    } else {
      streak = 1;
    }

    await db.query(
      'UPDATE users SET last_active = ?, streak = ? WHERE id = ?',
      [today, streak, user.id]
    );
    user.streak      = streak;
    user.last_active = today;

    return res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
