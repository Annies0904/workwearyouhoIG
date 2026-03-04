import { query } from '@/lib/db';

interface Stats {
  total_conversations: string;
  open_conversations: string;
  total_messages: string;
  ai_messages: string;
}

async function getStats(): Promise<Stats> {
  try {
    const res = await query<Stats>(`
      SELECT
        (SELECT COUNT(*) FROM conversations)::text              AS total_conversations,
        (SELECT COUNT(*) FROM conversations WHERE status='open')::text AS open_conversations,
        (SELECT COUNT(*) FROM messages)::text                   AS total_messages,
        (SELECT COUNT(*) FROM messages WHERE ai_generated=TRUE)::text AS ai_messages
    `);
    return res.rows[0];
  } catch {
    return { total_conversations: '–', open_conversations: '–', total_messages: '–', ai_messages: '–' };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: '總對話數', value: stats.total_conversations },
    { label: '進行中對話', value: stats.open_conversations },
    { label: '總訊息數', value: stats.total_messages },
    { label: 'AI 自動回覆', value: stats.ai_messages },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">概覽</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-3xl font-bold text-indigo-600">{c.value}</p>
            <p className="mt-1 text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
