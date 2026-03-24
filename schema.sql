-- ══════════════════════════════════════════════════════════
--  InterviewForge — MySQL Schema
--  Run: mysql -u root -p < docs/schema.sql
-- ══════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS interviewforge
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE interviewforge;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                 INT          AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(120) NOT NULL,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password_hash      VARCHAR(255) NOT NULL,
  role               VARCHAR(60)  DEFAULT 'Undergraduate',
  xp                 INT          DEFAULT 50,
  streak             INT          DEFAULT 0,
  last_active        DATE         DEFAULT (CURDATE()),
  questions_answered INT          DEFAULT 0,
  average_score      DECIMAL(5,2) DEFAULT 0.00,
  level              VARCHAR(60)  DEFAULT 'Novice',
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_xp    (xp DESC)
);

-- ── Interview Sessions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
  id              INT     AUTO_INCREMENT PRIMARY KEY,
  user_id         INT     NOT NULL,
  category        VARCHAR(80)             NOT NULL,
  difficulty      ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
  score           DECIMAL(5,2)            DEFAULT 0.00,
  questions_count INT                     DEFAULT 0,
  duration_secs   INT                     DEFAULT 0,
  xp_earned       INT                     DEFAULT 0,
  completed_at    DATETIME                DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Session Questions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_questions (
  id            INT  AUTO_INCREMENT PRIMARY KEY,
  session_id    INT  NOT NULL,
  question_text TEXT NOT NULL,
  user_answer   TEXT,
  ai_feedback   TEXT,
  score         DECIMAL(5,2) DEFAULT 0.00,
  asked_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id),
  FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- ── XP Events Ledger ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS xp_events (
  id         INT         AUTO_INCREMENT PRIMARY KEY,
  user_id    INT         NOT NULL,
  amount     INT         NOT NULL,
  reason     VARCHAR(120),
  created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Roadmap Progress ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id           INT     AUTO_INCREMENT PRIMARY KEY,
  user_id      INT     NOT NULL,
  phase_index  TINYINT NOT NULL,
  topic_index  TINYINT NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_roadmap (user_id, phase_index, topic_index),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Leaderboard View ──────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
  SELECT
    u.id,
    u.name,
    u.email,
    u.xp,
    u.streak,
    u.level,
    u.questions_answered,
    RANK() OVER (ORDER BY u.xp DESC) AS `rank`
  FROM users u
  ORDER BY u.xp DESC;
