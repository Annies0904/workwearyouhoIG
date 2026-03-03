'use strict';

require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const webhookRouter = require('./routes/webhook');

const app = express();

// Capture raw body for webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Rate-limit the webhook endpoint to guard against abuse
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,            // max 200 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/webhook', webhookLimiter, webhookRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[webhook] Server listening on port ${PORT}`);
});

module.exports = app; // exported for tests
