-- ══════════════════════════════════════════════
--  InterviewForge — PostgreSQL Schema for Neon
--  Run once via: psql $NEON_DB_URL -f schema.sql
--  OR paste into Neon Console → SQL Editor
-- ══════════════════════════════════════════════

-- ── Users ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(120)      NOT NULL,
  email             VARCHAR(255)      NOT NULL UNIQUE,
  password_hash     VARCHAR(255)      NOT NULL,
  role              VARCHAR(60)       DEFAULT 'Undergraduate',
  xp                INTEGER           DEFAULT 50,
  streak            INTEGER           DEFAULT 1,
  last_active       DATE              DEFAULT CURRENT_DATE,
  questions_answered INTEGER          DEFAULT 0,
  average_score     NUMERIC(5,2)      DEFAULT 0.00,
  level             VARCHAR(60)       DEFAULT 'Novice',
  created_at        TIMESTAMPTZ       DEFAULT NOW(),
  updated_at        TIMESTAMPTZ       DEFAULT NOW()
);

-- ── XP Events (ledger) ──────────────────────────
CREATE TABLE IF NOT EXISTS xp_events (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      INTEGER       NOT NULL,
  reason      VARCHAR(120),
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- ── Interview Sessions ──────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category        VARCHAR(80)     NOT NULL,
  difficulty      VARCHAR(20)     DEFAULT 'Medium',
  score           NUMERIC(5,2)    DEFAULT 0.00,
  questions_count INTEGER         DEFAULT 0,
  duration_secs   INTEGER         DEFAULT 0,
  xp_earned       INTEGER         DEFAULT 0,
  completed_at    TIMESTAMPTZ     DEFAULT NOW()
);

-- ── Roadmap Progress ────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phase_index  SMALLINT    NOT NULL,
  topic_index  SMALLINT    NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, phase_index, topic_index)
);

-- ── Indexes ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_xp    ON users(xp DESC);
CREATE INDEX IF NOT EXISTS idx_xp_user     ON xp_events(user_id);

-- Add password_last_changed column
ALTER TABLE users ADD COLUMN password_last_changed TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add last_login column
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;

-- Add reset_token column
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;

-- Add reset_expiry column
ALTER TABLE users ADD COLUMN reset_expiry TIMESTAMP NULL;
