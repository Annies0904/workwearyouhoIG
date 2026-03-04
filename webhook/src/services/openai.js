'use strict';

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

let _client;
function getClient() {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'placeholder' });
  }
  return _client;
}

const MODEL = () => process.env.OPENAI_MODEL || 'gpt-4o';
const CONFIDENCE_THRESHOLD = () => parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.6');

const systemPromptTemplate = fs.readFileSync(
  path.join(__dirname, '../../../ai/prompts/system.md'),
  'utf8'
);
const replySchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../ai/schemas/reply.json'), 'utf8')
);

/**
 * Build the system prompt by injecting FAQ and conversation history.
 * @param {Array<{category:string, question:string, answer:string}>} faqs
 * @param {Array<{direction:string, content:string}>} history
 * @param {string} userMessage
 */
function buildPrompt(faqs, history, userMessage) {
  const faqContext = faqs
    .map(f => `Q: ${f.question}\nA: ${f.answer}`)
    .join('\n\n');

  const conversationHistory = history
    .map(m => `${m.direction === 'inbound' ? 'Customer' : 'Assistant'}: ${m.content}`)
    .join('\n');

  return systemPromptTemplate
    .replace('{{FAQ_CONTEXT}}', faqContext || '(no FAQ entries available)')
    .replace('{{CONVERSATION_HISTORY}}', conversationHistory || '(new conversation)')
    .replace('{{USER_MESSAGE}}', userMessage);
}

/**
 * Generate a reply using OpenAI structured outputs.
 * @returns {Promise<{reply:string, confidence:number, needs_human:boolean, category:string, usage:object}>}
 */
async function generateReply(faqs, history, userMessage) {
  const prompt = buildPrompt(faqs, history, userMessage);

  const response = await getClient().chat.completions.create({
    model: MODEL(),
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_schema',
      json_schema: replySchema,
    },
    temperature: 0.4,
  });

  const choice = response.choices[0];
  const parsed = JSON.parse(choice.message.content);

  // Override needs_human if confidence is below threshold
  if (parsed.confidence < CONFIDENCE_THRESHOLD()) {
    parsed.needs_human = true;
  }

  return {
    ...parsed,
    usage: response.usage,
  };
}

module.exports = { generateReply };
