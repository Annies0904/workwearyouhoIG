'use strict';

const express = require('express');
const { verifySignature } = require('../middleware/verify');
const db = require('../services/database');
const ig = require('../services/instagram');
const ai = require('../services/openai');

const router = express.Router();
const VERIFY_TOKEN = () => process.env.IG_VERIFY_TOKEN;

// ---------------------------------------------------------------------------
// GET /webhook – Meta webhook verification handshake
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN()) {
    console.log('[webhook] Verification successful');
    return res.status(200).send(challenge);
  }
  return res.status(403).json({ error: 'Verification failed' });
});

// ---------------------------------------------------------------------------
// POST /webhook – Receive Instagram events
// ---------------------------------------------------------------------------
router.post('/', verifySignature, async (req, res) => {
  // Acknowledge immediately (Meta requires a 200 within 20 s)
  res.sendStatus(200);

  const body = req.body;
  if (body.object !== 'instagram') return;

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      await handleMessagingEvent(event).catch(err =>
        console.error('[webhook] Error handling event:', err)
      );
    }
  }
});

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function handleMessagingEvent(event) {
  const { sender, recipient, message, timestamp } = event;

  // Ignore echoes (messages sent by the page itself)
  if (message?.is_echo) return;
  // Only handle text messages for now
  if (!message?.text) return;

  const igUserId  = sender.id;
  const igThreadId = `${sender.id}_${recipient.id}`;
  const igMessageId = message.mid;
  const userText  = message.text;

  console.log(`[webhook] Inbound message from ${igUserId}: "${userText}"`);

  // 1. Resolve or create conversation
  const userInfo       = await ig.getUserInfo(igUserId);
  const conversationId = await db.upsertConversation(igThreadId, igUserId, userInfo.name);

  // 2. Save inbound message
  const msgId = await db.saveMessage({
    conversationId,
    igMessageId,
    direction: 'inbound',
    content: userText,
  });

  // 3. Fetch context
  const [history, faqs] = await Promise.all([
    db.getRecentMessages(conversationId, 10),
    db.getActiveFaqs('zh'),
  ]);

  // 4. Generate AI reply
  let aiResult;
  try {
    aiResult = await ai.generateReply(faqs, history, userText);
  } catch (err) {
    console.error('[webhook] OpenAI error:', err);
    await db.logAiCall({ messageId: msgId, model: process.env.OPENAI_MODEL || 'gpt-4o', error: String(err) });
    return;
  }

  // 5. Log AI call
  await db.logAiCall({
    messageId: msgId,
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    promptTokens: aiResult.usage?.prompt_tokens,
    completionTokens: aiResult.usage?.completion_tokens,
    totalTokens: aiResult.usage?.total_tokens,
    replyText: aiResult.reply,
  });

  // 6. If flagged for human review, skip auto-reply
  if (aiResult.needs_human) {
    console.log(`[webhook] Message flagged for human review (confidence=${aiResult.confidence})`);
    return;
  }

  // 7. Send reply via Instagram API
  try {
    await ig.sendReply(igUserId, aiResult.reply);
  } catch (err) {
    console.error('[webhook] Failed to send IG reply:', err?.response?.data || err.message);
    return;
  }

  // 8. Save outbound message
  await db.saveMessage({
    conversationId,
    igMessageId: `outbound_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    direction: 'outbound',
    content: aiResult.reply,
    aiGenerated: true,
  });

  console.log(`[webhook] Replied to ${igUserId}: "${aiResult.reply}"`);
}

module.exports = router;
