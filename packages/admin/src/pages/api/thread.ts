import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { senderId } = req.query;
  if (!senderId) return res.status(400).json({ error: 'senderId required' });

  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT
       m.id,
       m.sender_id,
       m.message_type,
       m.message_text,
       m.intent,
       m.received_at,
       d.id        AS draft_id,
       d.draft_text,
       d.status    AS draft_status
     FROM messages m
     LEFT JOIN drafts d ON d.message_id = m.id
     WHERE m.sender_id = $1
     ORDER BY m.received_at ASC`,
    [senderId]
  );

  res.status(200).json({ thread: rows });
}
