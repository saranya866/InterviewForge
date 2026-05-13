const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
router.use(auth);

router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { category, difficulty, score, questions_count, duration_secs, xp_earned } = req.body;

    const [sessResult] = await client.query(
      `INSERT INTO interview_sessions
         (user_id, category, difficulty, score, questions_count, duration_secs, xp_earned)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [req.user.id, category, difficulty || 'Medium', score || 0,
       questions_count || 0, duration_secs || 0, xp_earned || 0]
    );
    const sessionId = sessResult[0].id;

    await client.query(
      `UPDATE users SET
         questions_answered = questions_answered + $1,
         xp = xp + $2
       WHERE id = $3`,
      [questions_count || 0, xp_earned || 0, req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ session_id: sessionId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20'), 100);
    const [rows] = await db.query(
      `SELECT id, category, difficulty, score, questions_count,
              duration_secs, xp_earned, completed_at
       FROM interview_sessions
       WHERE user_id = $1
       ORDER BY completed_at DESC
       LIMIT $2`,
      [req.user.id, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [session] = await db.query(
      'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (session.length === 0) return res.status(404).json({ error: 'Session not found' });

    res.json(session[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;