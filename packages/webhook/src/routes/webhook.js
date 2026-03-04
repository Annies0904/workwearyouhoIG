'use strict';

const express = require('express');
const crypto = require('crypto');
const { saveMessage } = require('../services/db');
const { classifyIntent, generateDraft } = require('../services/openai');

const router = express.Router();

/**
 * GET /webhook
 * Instagram webhook verification (hub challenge)
 */
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * POST /webhook
 * Receive Instagram DM / comment events
 */
router.post('/', async (req, res) => {
  // Verify signature
  const signature = req.headers['x-hub-signature-256'];
  if (!verifySignature(req.body, signature)) {
    console.warn('Invalid webhook signature');
    return res.sendStatus(403);
  }

  const body = req.body;
  if (body.object !== 'instagram') {
    return res.sendStatus(404);
  }

  // Acknowledge immediately
  res.sendStatus(200);

  // Process each entry asynchronously
  for (const entry of body.entry || []) {
    await processEntry(entry);
  }
});

async function processEntry(entry) {
  // Handle Direct Messages
  for (const event of entry.messaging || []) {
    if (event.message && !event.message.is_echo) {
      await handleDirectMessage(entry.id, event);
    }
  }

  // Handle Comments
  for (const change of entry.changes || []) {
    if (change.field === 'comments') {
      await handleComment(entry.id, change.value);
    }
  }
}

async function handleDirectMessage(pageId, event) {
  try {
    const senderId = event.sender.id;
    const messageText = event.message.text || '';
    const messageId = event.message.mid;
    const timestamp = new Date(event.timestamp);

    console.log(`DM from ${senderId}: ${messageText}`);

    // Classify intent using OpenAI
    const intent = await classifyIntent(messageText);

    // Generate draft reply
    const draft = await generateDraft(messageText, intent);

    // Save to database
    await saveMessage({
      platform_message_id: messageId,
      sender_id: senderId,
      page_id: pageId,
      message_type: 'dm',
      message_text: messageText,
      intent,
      draft_reply: draft,
      received_at: timestamp,
    });

    console.log(`Saved DM ${messageId} with intent=${intent}`);
  } catch (err) {
    console.error('Error handling DM:', err);
  }
}

async function handleComment(pageId, comment) {
  try {
    const commentId = comment.id;
    const senderId = comment.from?.id;
    const messageText = comment.text || '';
    const timestamp = comment.created_time
      ? new Date(comment.created_time * 1000)
      : new Date();

    console.log(`Comment from ${senderId}: ${messageText}`);

    // Classify intent
    const intent = await classifyIntent(messageText);

    // Generate short comment draft (引導私訊/LINE strategy)
    const draft = await generateDraft(messageText, intent, 'comment');

    // Save to database
    await saveMessage({
      platform_message_id: commentId,
      sender_id: senderId,
      page_id: pageId,
      message_type: 'comment',
      message_text: messageText,
      intent,
      draft_reply: draft,
      received_at: timestamp,
    });

    console.log(`Saved comment ${commentId} with intent=${intent}`);
  } catch (err) {
    console.error('Error handling comment:', err);
  }
}

/**
 * Verify the X-Hub-Signature-256 header from Meta
 */
function verifySignature(body, signature) {
  if (!signature || !process.env.INSTAGRAM_APP_SECRET) return false;
  const expected = `sha256=${crypto
    .createHmac('sha256', process.env.INSTAGRAM_APP_SECRET)
    .update(JSON.stringify(body))
    .digest('hex')}`;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

module.exports = router;
