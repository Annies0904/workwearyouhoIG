import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const pool = getPool();
  const { rows } = await pool.query(`
    SELECT
      m.id,
      m.sender_id,
      m.message_type,
      m.message_text,
      m.intent,
      m.received_at,
      d.id        AS draft_id,
      d.draft_text,
      d.status    AS draft_status,
      d.risk_safe,
      d.risk_reason
    FROM messages m
    LEFT JOIN drafts d ON d.message_id = m.id
    WHERE d.status = 'pending' OR d.id IS NULL
    ORDER BY m.received_at DESC
    LIMIT 100
  `);

  res.status(200).json({ messages: rows });
}
