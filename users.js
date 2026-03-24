// routes/users.js — /api/users/*  (all routes require JWT)
const express = require('express');
const auth    = require('../middleware/auth');
const db      = require('../db');

const router = express.Router();
router.use(auth);

// ── GET /api/users/me ─────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const [[user]] = await db.query(
      `SELECT id, name, email, role, xp, streak, last_active,
              questions_answered, average_score, level, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('[users/me GET]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PATCH /api/users/me ───────────────────────────────────
router.patch('/me', async (req, res) => {
  try {
    const { name, role } = req.body;
    await db.query(
      `UPDATE users
       SET name = COALESCE(?, name), role = COALESCE(?, role)
       WHERE id = ?`,
      [name || null, role || null, req.user.id]
    );
    const [[user]] = await db.query(
      `SELECT id, name, email, role, xp, streak,
              questions_answered, average_score, level
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    return res.json(user);
  } catch (err) {
    console.error('[users/me PATCH]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/users/xp ────────────────────────────────────
// Body: { amount: number, reason?: string }
router.post('/xp', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const pts = parseInt(amount);
    if (!pts || isNaN(pts)) {
      return res.status(400).json({ error: 'amount must be a non-zero number' });
    }

    // Log XP event
    await db.query(
      'INSERT INTO xp_events (user_id, amount, reason) VALUES (?, ?, ?)',
      [req.user.id, pts, reason || null]
    );

    // Update user total XP
    await db.query(
      'UPDATE users SET xp = xp + ? WHERE id = ?',
      [pts, req.user.id]
    );

    // Recompute level
    const [[{ xp }]] = await db.query(
      'SELECT xp FROM users WHERE id = ?', [req.user.id]
    );
    const level = computeLevel(xp);
    await db.query(
      'UPDATE users SET level = ? WHERE id = ?', [level, req.user.id]
    );

    return res.json({ xp, level });
  } catch (err) {
    console.error('[users/xp]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/users/roadmap ────────────────────────────────
router.get('/roadmap', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT phase_index, topic_index FROM roadmap_progress WHERE user_id = ?',
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[users/roadmap GET]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/users/roadmap ───────────────────────────────
// Body: { phase_index: number, topic_index: number }
router.post('/roadmap', async (req, res) => {
  try {
    const { phase_index, topic_index } = req.body;
    if (phase_index === undefined || topic_index === undefined) {
      return res.status(400).json({ error: 'phase_index and topic_index required' });
    }
    await db.query(
      `INSERT IGNORE INTO roadmap_progress (user_id, phase_index, topic_index)
       VALUES (?, ?, ?)`,
      [req.user.id, phase_index, topic_index]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('[users/roadmap POST]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── helpers ──────────────────────────────────────────────
function computeLevel(xp) {
  if (xp >= 15000) return 'Grandmaster';
  if (xp >= 7500)  return 'Master';
  if (xp >= 3500)  return 'Expert';
  if (xp >= 1500)  return 'Practitioner';
  if (xp >= 500)   return 'Apprentice';
  return 'Novice';
}

module.exports = router;
