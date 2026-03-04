import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

/**
 * POST /api/send
 * Sends an approved draft via the Instagram Graph API.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { draftId } = req.body;
  if (!draftId) return res.status(400).json({ error: 'draftId required' });

  const pool = getPool();

  // Fetch draft + original message
  const { rows } = await pool.query(
    `SELECT d.id, d.draft_text, d.status, m.sender_id, m.message_type, m.platform_message_id
     FROM drafts d
     JOIN messages m ON m.id = d.message_id
     WHERE d.id = $1`,
    [draftId]
  );

  if (rows.length === 0) return res.status(404).json({ error: 'draft not found' });
  const draft = rows[0];

  if (draft.status === 'sent') return res.status(409).json({ error: 'already sent' });
  if (draft.status === 'rejected') return res.status(400).json({ error: 'draft rejected' });

  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: 'INSTAGRAM_PAGE_ACCESS_TOKEN not configured' });

  try {
    let igResponse: Response;

    if (draft.message_type === 'dm') {
      // Send DM via Messenger Send API
      igResponse = await fetch(
        'https://graph.facebook.com/v20.0/me/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipient: { id: draft.sender_id },
            message: { text: draft.draft_text },
            messaging_type: 'RESPONSE',
          }),
        }
      );
    } else {
      // Reply to comment
      igResponse = await fetch(
        `https://graph.facebook.com/v20.0/${draft.platform_message_id}/replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ message: draft.draft_text }),
        }
      );
    }

    if (!igResponse.ok) {
      const err = await igResponse.json();
      return res.status(502).json({ error: 'IG API error', detail: err });
    }

    // Mark draft as sent
    await pool.query(
      "UPDATE drafts SET status = 'sent', sent_at = NOW(), updated_at = NOW() WHERE id = $1",
      [draftId]
    );

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send error:', err);
    return res.status(500).json({ error: 'internal error' });
  }
}
