const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(auth);

router.get('/me', async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, xp, streak, last_active, questions_answered, average_score, level FROM users WHERE id = $1',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/me', async (req, res) => {
  try {
    const { name, role } = req.body;
    await db.query(
      'UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role) WHERE id = $3',
      [name || null, role || null, req.user.id]
    );
    const [users] = await db.query(
      'SELECT id, name, email, role, xp, streak, questions_answered, average_score, level FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/xp', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'amount must be a number' });
    }

    await db.query(
      'INSERT INTO xp_events (user_id, amount, reason) VALUES ($1, $2, $3)',
      [req.user.id, amount, reason || null]
    );

    await db.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [amount, req.user.id]);

    const [users] = await db.query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
    let level = 'Novice';
    if (users[0].xp >= 15000) level = 'Grandmaster';
    else if (users[0].xp >= 7500) level = 'Master';
    else if (users[0].xp >= 3500) level = 'Expert';
    else if (users[0].xp >= 1500) level = 'Practitioner';
    else if (users[0].xp >= 500) level = 'Apprentice';
    
    await db.query('UPDATE users SET level = $1 WHERE id = $2', [level, req.user.id]);

    res.json({ xp: users[0].xp, level });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/roadmap', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT phase_index, topic_index FROM roadmap_progress WHERE user_id = $1',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/roadmap', async (req, res) => {
  try {
    const { phase_index, topic_index } = req.body;
    await db.query(
      `INSERT INTO roadmap_progress (user_id, phase_index, topic_index)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [req.user.id, phase_index, topic_index]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;