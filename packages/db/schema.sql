-- IG Auto-Reply Assistant MVP — Postgres Schema
-- Run once to initialize the database

-- Messages: incoming IG DMs and comments
CREATE TABLE IF NOT EXISTS messages (
  id                   SERIAL PRIMARY KEY,
  platform_message_id  VARCHAR(255) UNIQUE NOT NULL,
  sender_id            VARCHAR(255) NOT NULL,
  page_id              VARCHAR(255) NOT NULL,
  message_type         VARCHAR(20)  NOT NULL CHECK (message_type IN ('dm', 'comment')),
  message_text         TEXT         NOT NULL,
  intent               VARCHAR(50)  NOT NULL DEFAULT 'general',
  received_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Drafts: AI-generated (and human-edited) reply drafts
CREATE TABLE IF NOT EXISTS drafts (
  id           SERIAL PRIMARY KEY,
  message_id   INTEGER      NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  draft_text   TEXT         NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'sent', 'rejected')),
  risk_safe    BOOLEAN,
  risk_reason  TEXT,
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Reply templates: curated zh response templates by category
CREATE TABLE IF NOT EXISTS templates (
  id           SERIAL PRIMARY KEY,
  category     VARCHAR(100) NOT NULL,
  label        VARCHAR(255) NOT NULL,
  content      TEXT         NOT NULL,
  language     VARCHAR(10)  NOT NULL DEFAULT 'zh-TW',
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- FAQ entries: frequently asked questions and standard answers
CREATE TABLE IF NOT EXISTS faq (
  id           SERIAL PRIMARY KEY,
  question     TEXT         NOT NULL,
  answer       TEXT         NOT NULL,
  category     VARCHAR(100),
  language     VARCHAR(10)  NOT NULL DEFAULT 'zh-TW',
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_id   ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_page_id     ON messages (page_id);
CREATE INDEX IF NOT EXISTS idx_messages_intent      ON messages (intent);
CREATE INDEX IF NOT EXISTS idx_messages_received_at ON messages (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_message_id    ON drafts (message_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status        ON drafts (status);
CREATE INDEX IF NOT EXISTS idx_templates_category   ON templates (category);
