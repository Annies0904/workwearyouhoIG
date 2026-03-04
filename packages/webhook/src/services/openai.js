'use strict';

const OpenAI = require('openai');
const { INTENT_PROMPT, DRAFT_PROMPT, RISK_PROMPT } = require('../prompts');

let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Classify the intent of an incoming message.
 * Returns one of: pricing | availability | product_info | complaint | general | spam
 */
async function classifyIntent(messageText) {
  const client = getClient();
  const resp = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      { role: 'system', content: INTENT_PROMPT },
      { role: 'user', content: messageText },
    ],
  });
  const raw = resp.choices[0].message.content.trim().toLowerCase();
  const valid = ['pricing', 'availability', 'product_info', 'complaint', 'general', 'spam'];
  return valid.includes(raw) ? raw : 'general';
}

/**
 * Generate a draft reply for the message.
 * @param {string} messageText  Original message
 * @param {string} intent       Classified intent
 * @param {string} replyType    'dm' (default) | 'comment'
 */
async function generateDraft(messageText, intent, replyType = 'dm') {
  const client = getClient();
  const systemPrompt = DRAFT_PROMPT(intent, replyType);
  const resp = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: messageText },
    ],
  });
  return resp.choices[0].message.content.trim();
}

/**
 * Run a risk check on a draft before sending.
 * Returns { safe: boolean, reason: string }
 */
async function reviewRisk(draft) {
  const client = getClient();
  const resp = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: RISK_PROMPT },
      { role: 'user', content: draft },
    ],
  });
  try {
    return JSON.parse(resp.choices[0].message.content);
  } catch {
    return { safe: false, reason: 'JSON parse error' };
  }
}

module.exports = { classifyIntent, generateDraft, reviewRisk };
