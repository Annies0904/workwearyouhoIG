import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ThreadMessage {
  id: number;
  sender_id: string;
  message_type: string;
  message_text: string;
  intent: string;
  received_at: string;
  draft_id: number | null;
  draft_text: string | null;
  draft_status: string | null;
}

export default function ThreadPage() {
  const router = useRouter();
  const { senderId } = router.query as { senderId: string };

  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!senderId) return;
    fetch(`/api/thread?senderId=${encodeURIComponent(senderId)}`)
      .then((r) => r.json())
      .then((d) => setThread(d.thread))
      .finally(() => setLoading(false));
  }, [senderId]);

  return (
    <>
      <header>
        <Link href="/">← 返回收件匣</Link>
        <h1 style={{ marginLeft: 12 }}>對話串 — {senderId}</h1>
      </header>

      <div className="container">
        {loading && <p>載入中…</p>}
        {!loading && thread.length === 0 && <p>無訊息記錄</p>}

        {thread.map((msg) => (
          <div key={msg.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className={`badge badge-${msg.message_type}`}>
                {msg.message_type === 'dm' ? '📩 DM' : '💬 留言'}
              </span>
              <span className="intent-tag">{msg.intent}</span>
              {msg.draft_status && (
                <span className={`badge badge-${msg.draft_status}`}>{msg.draft_status}</span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
                {new Date(msg.received_at).toLocaleString('zh-TW')}
              </span>
            </div>

            <p style={{ marginBottom: 6 }}>{msg.message_text}</p>

            {msg.draft_text && (
              <p style={{ background: '#f9f9f9', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#555' }}>
                草稿：{msg.draft_text}
              </p>
            )}

            {msg.draft_id && msg.draft_status === 'pending' && (
              <div style={{ marginTop: 8 }}>
                <Link href={`/draft/${msg.draft_id}`}>
                  <button className="btn-primary">審稿 / 送出</button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
