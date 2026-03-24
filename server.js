// server.js — InterviewForge Express API
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');

const authRoutes        = require('./routes/auth');
const userRoutes        = require('./routes/users');
const sessionRoutes     = require('./routes/sessions');
const leaderboardRoutes = require('./routes/leaderboard');

const app  = express();
const PORT = parseInt(process.env.PORT || '3001');

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/sessions',    sessionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', ts: new Date().toISOString() })
);

// ── 404 ──────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ─────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  InterviewForge API running on http://localhost:${PORT}`);
});
