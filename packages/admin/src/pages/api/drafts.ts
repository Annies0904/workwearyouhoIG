import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';
import { reviewRisk } from '../../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = getPool();

  // GET /api/drafts?draftId=X — fetch single draft with risk info
  if (req.method === 'GET') {
    const { draftId } = req.query;
    if (!draftId) return res.status(400).json({ error: 'draftId required' });

    const { rows } = await pool.query(
      `SELECT d.*, m.message_text, m.intent, m.message_type, m.sender_id
       FROM drafts d
       JOIN messages m ON m.id = d.message_id
       WHERE d.id = $1`,
      [draftId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not found' });
    return res.status(200).json({ draft: rows[0] });
  }

  // PATCH /api/drafts — update draft text or status
  if (req.method === 'PATCH') {
    const { draftId, status, draftText } = req.body;
    if (!draftId || !status) return res.status(400).json({ error: 'draftId and status required' });

    if (draftText !== undefined) {
      await pool.query(
        'UPDATE drafts SET status = $1, draft_text = $2, updated_at = NOW() WHERE id = $3',
        [status, draftText, draftId]
      );
    } else {
      await pool.query(
        'UPDATE drafts SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, draftId]
      );
    }
    return res.status(200).json({ ok: true });
  }

  // POST /api/drafts/risk — run risk check on draft text
  if (req.method === 'POST') {
    const { draftText, draftId } = req.body;
    if (!draftText) return res.status(400).json({ error: 'draftText required' });

    const result = await reviewRisk(draftText);

    // Optionally persist risk result
    if (draftId) {
      await pool.query(
        'UPDATE drafts SET risk_safe = $1, risk_reason = $2, updated_at = NOW() WHERE id = $3',
        [result.safe, result.reason, draftId]
      );
    }
    return res.status(200).json(result);
  }

  return res.status(405).end();
}
