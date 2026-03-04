'use strict';

const axios = require('axios');

const BASE_URL = 'https://graph.facebook.com/v19.0';
const PAGE_ACCESS_TOKEN = () => process.env.IG_PAGE_ACCESS_TOKEN;

/**
 * Send a DM reply via the Instagram Graph API.
 * @param {string} recipientIgId  Instagram-scoped user ID
 * @param {string} messageText    Text to send
 */
async function sendReply(recipientIgId, messageText) {
  const pageId = process.env.IG_PAGE_ID;
  const url = `${BASE_URL}/${pageId}/messages`;

  const res = await axios.post(
    url,
    {
      recipient: { id: recipientIgId },
      message: { text: messageText },
      messaging_type: 'RESPONSE',
    },
    { params: { access_token: PAGE_ACCESS_TOKEN() } }
  );

  return res.data;
}

/**
 * Fetch the Instagram username for a given IGSID (Instagram-scoped user ID).
 * Requires the page_messaging permission.
 */
async function getUserInfo(igScopedId) {
  try {
    const res = await axios.get(`${BASE_URL}/${igScopedId}`, {
      params: {
        fields: 'name,profile_pic',
        access_token: PAGE_ACCESS_TOKEN(),
      },
    });
    return res.data;
  } catch {
    return { name: null };
  }
}

module.exports = { sendReply, getUserInfo };
