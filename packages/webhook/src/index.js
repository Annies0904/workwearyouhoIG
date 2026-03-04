'use strict';

require('dotenv').config();
const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Instagram webhook
app.use('/webhook', webhookRouter);

app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});

module.exports = app;
