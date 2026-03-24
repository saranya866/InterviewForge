// routes/sessions.js — /api/sessions/*  (all routes require JWT)
const express = require('express');
const auth    = require('../middleware/auth');
const db      = require('../db');

const router = express.Router();
router.use(auth);

// ── POST /api/sessions ────────────────────────────────────
// Save a completed interview session (mock, exam, topic test)
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      category,
      difficulty      = 'Medium',
      score           = 0,
      questions_count = 0,
      duration_secs   = 0,
      xp_earned       = 0,
      questions       = [],   // array of { question_text, user_answer, ai_feedback, score }
    } = req.body;

    if (!category) {
      await conn.rollback();
      return res.status(400).json({ error: 'category is required' });
    }

    // Insert session row
    const [sessResult] = await conn.query(
      `INSERT INTO interview_sessions
         (user_id, category, difficulty, score, questions_count, duration_secs, xp_earned)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category, difficulty, score,
       questions_count, duration_secs, xp_earned]
    );
    const sessionId = sessResult.insertId;

    // Insert individual question records
    if (Array.isArray(questions) && questions.length > 0) {
      const rows = questions.map(q => [
        sessionId,
        q.question_text || '',
        q.user_answer   || null,
        q.ai_feedback   || null,
        q.score         || 0,
      ]);
      await conn.query(
        `INSERT INTO session_questions
           (session_id, question_text, user_answer, ai_feedback, score)
         VALUES ?`,
        [rows]
      );
    }

    // Update user aggregate stats atomically
    // Running average: new_avg = (old_avg * old_count + score * count) / (old_count + count)
    if (questions_count > 0) {
      await conn.query(
        `UPDATE users
         SET questions_answered = questions_answered + ?,
             average_score      = (average_score * questions_answered + ? * ?) /
                                  GREATEST(questions_answered + ?, 1),
             xp                 = xp + ?
         WHERE id = ?`,
        [questions_count, score, questions_count,
         questions_count, xp_earned, req.user.id]
      );
    } else if (xp_earned > 0) {
      await conn.query(
        'UPDATE users SET xp = xp + ? WHERE id = ?',
        [xp_earned, req.user.id]
      );
    }

    await conn.commit();
    return res.status(201).json({ session_id: sessionId });
  } catch (err) {
    await conn.rollback();
    console.error('[sessions POST]', err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// ── GET /api/sessions ─────────────────────────────────────
// List recent sessions for the current user
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20'), 100);
    const [rows] = await db.query(
      `SELECT id, category, difficulty, score, questions_count,
              duration_secs, xp_earned, completed_at
       FROM interview_sessions
       WHERE user_id = ?
       ORDER BY completed_at DESC
       LIMIT ?`,
      [req.user.id, limit]
    );
    return res.json(rows);
  } catch (err) {
    console.error('[sessions GET]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/sessions/:id ─────────────────────────────────
// Fetch a single session with all its question records
router.get('/:id', async (req, res) => {
  try {
    const [[session]] = await db.query(
      'SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const [questions] = await db.query(
      'SELECT * FROM session_questions WHERE session_id = ? ORDER BY asked_at',
      [session.id]
    );

    return res.json({ ...session, questions });
  } catch (err) {
    console.error('[sessions/:id GET]', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
