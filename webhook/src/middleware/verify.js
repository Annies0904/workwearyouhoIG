'use strict';

const crypto = require('crypto');

/**
 * Verify that the incoming request is genuinely from Meta.
 * Uses the X-Hub-Signature-256 header.
 */
function verifySignature(req, res, next) {
  const appSecret = process.env.IG_APP_SECRET;
  if (!appSecret) {
    // Skip verification in development when secret is not configured
    console.warn('[verify] IG_APP_SECRET not set – skipping signature check');
    return next();
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
  const expected = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  next();
}

module.exports = { verifySignature };
