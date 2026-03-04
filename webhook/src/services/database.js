'use strict';

const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

/**
 * Upsert a conversation record and return its id.
 * @param {string} igThreadId
 * @param {string} igUserId
 * @param {string|null} igUsername
 * @returns {Promise<number>} conversation.id
 */
async function upsertConversation(igThreadId, igUserId, igUsername = null) {
  const db = getPool();
  const res = await db.query(
    `INSERT INTO conversations (ig_thread_id, ig_user_id, ig_username)
     VALUES ($1, $2, $3)
     ON CONFLICT (ig_thread_id) DO UPDATE
       SET ig_username = EXCLUDED.ig_username,
           updated_at  = NOW()
     RETURNING id`,
    [igThreadId, igUserId, igUsername]
  );
  return res.rows[0].id;
}

/**
 * Save an inbound or outbound message.
 */
async function saveMessage({ conversationId, igMessageId, direction, content, aiGenerated = false }) {
  const db = getPool();
  const res = await db.query(
    `INSERT INTO messages (conversation_id, ig_message_id, direction, content, ai_generated)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (ig_message_id) DO NOTHING
     RETURNING id`,
    [conversationId, igMessageId, direction, content, aiGenerated]
  );
  return res.rows[0]?.id ?? null;
}

/**
 * Fetch recent messages for a conversation (for context window).
 * @param {number} conversationId
 * @param {number} limit
 */
async function getRecentMessages(conversationId, limit = 10) {
  const db = getPool();
  const res = await db.query(
    `SELECT direction, content, sent_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY sent_at DESC
     LIMIT $2`,
    [conversationId, limit]
  );
  return res.rows.reverse();
}

/**
 * Fetch active FAQ entries.
 * @param {string} language
 */
async function getActiveFaqs(language = 'zh') {
  const db = getPool();
  const res = await db.query(
    `SELECT category, question, answer
     FROM faqs
     WHERE active = TRUE AND language = $1
     ORDER BY category, id`,
    [language]
  );
  return res.rows;
}

/**
 * Log an AI call.
 */
async function logAiCall({ messageId, model, promptTokens, completionTokens, totalTokens, replyText, error }) {
  const db = getPool();
  await db.query(
    `INSERT INTO ai_logs
       (message_id, model, prompt_tokens, completion_tokens, total_tokens, reply_text, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [messageId, model, promptTokens, completionTokens, totalTokens, replyText, error ?? null]
  );
}

module.exports = { upsertConversation, saveMessage, getRecentMessages, getActiveFaqs, logAiCall };
