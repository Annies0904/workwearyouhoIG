import { query } from '@/lib/db';
import Link from 'next/link';

interface Conversation {
  id: number;
  ig_username: string | null;
  ig_user_id: string;
  status: string;
  updated_at: string;
  message_count: string;
}

async function getConversations(): Promise<Conversation[]> {
  try {
    const res = await query<Conversation>(`
      SELECT
        c.id,
        c.ig_username,
        c.ig_user_id,
        c.status,
        c.updated_at,
        COUNT(m.id)::text AS message_count
      FROM conversations c
      LEFT JOIN messages m ON m.conversation_id = c.id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
      LIMIT 100
    `);
    return res.rows;
  } catch {
    return [];
  }
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  resolved: 'bg-gray-100 text-gray-600',
  spam: 'bg-red-100 text-red-700',
};

export default async function ConversationsPage() {
  const conversations = await getConversations();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">對話列表</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-500">尚無對話紀錄。</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['用戶', '狀態', '訊息數', '最後更新'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {conversations.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">
                    {c.ig_username ?? c.ig_user_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[c.status] ?? ''}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.message_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(c.updated_at).toLocaleString('zh-TW')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
