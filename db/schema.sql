-- IG Reply Helper – Postgres Schema
-- Run once to initialize the database

-- Conversations: one per Instagram thread
CREATE TABLE IF NOT EXISTS conversations (
  id            SERIAL PRIMARY KEY,
  ig_thread_id  TEXT        NOT NULL UNIQUE,
  ig_user_id    TEXT        NOT NULL,
  ig_username   TEXT,
  status        TEXT        NOT NULL DEFAULT 'open',   -- open | resolved | spam
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages: individual DM messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER     NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  ig_message_id   TEXT        NOT NULL UNIQUE,
  direction       TEXT        NOT NULL,                -- inbound | outbound
  content         TEXT        NOT NULL,
  ai_generated    BOOLEAN     NOT NULL DEFAULT FALSE,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FAQs: question-answer pairs used by the AI as context
CREATE TABLE IF NOT EXISTS faqs (
  id         SERIAL PRIMARY KEY,
  category   TEXT        NOT NULL DEFAULT 'general',
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  language   TEXT        NOT NULL DEFAULT 'zh',
  active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reply templates: canned responses for common situations
CREATE TABLE IF NOT EXISTS reply_templates (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  language   TEXT        NOT NULL DEFAULT 'zh',
  active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI logs: record every OpenAI call for cost tracking & debugging
CREATE TABLE IF NOT EXISTS ai_logs (
  id              SERIAL PRIMARY KEY,
  message_id      INTEGER     REFERENCES messages(id) ON DELETE SET NULL,
  model           TEXT        NOT NULL,
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_tokens    INTEGER,
  reply_text      TEXT,
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status  ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_faqs_language         ON faqs(language);

-- Trigger: keep conversations.updated_at fresh
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_faqs_updated ON faqs;
CREATE TRIGGER trg_faqs_updated
  BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
