'use strict';

const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

/**
 * Save an incoming message and its AI-generated draft to the DB.
 */
async function saveMessage({
  platform_message_id,
  sender_id,
  page_id,
  message_type,
  message_text,
  intent,
  draft_reply,
  received_at,
}) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    const msgResult = await client.query(
      `INSERT INTO messages
        (platform_message_id, sender_id, page_id, message_type, message_text, intent, received_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (platform_message_id) DO NOTHING
       RETURNING id`,
      [platform_message_id, sender_id, page_id, message_type, message_text, intent, received_at]
    );

    if (msgResult.rows.length > 0 && draft_reply) {
      const messageId = msgResult.rows[0].id;
      await client.query(
        `INSERT INTO drafts (message_id, draft_text, status)
         VALUES ($1, $2, 'pending')`,
        [messageId, draft_reply]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update the status of a draft (pending | approved | sent | rejected).
 */
async function updateDraftStatus(draftId, status, editedText = null) {
  const pool = getPool();
  if (editedText !== null) {
    await pool.query(
      'UPDATE drafts SET status = $1, draft_text = $2, updated_at = NOW() WHERE id = $3',
      [status, editedText, draftId]
    );
  } else {
    await pool.query(
      'UPDATE drafts SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, draftId]
    );
  }
}

module.exports = { saveMessage, updateDraftStatus };
