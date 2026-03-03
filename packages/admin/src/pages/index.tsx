import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Message {
  id: number;
  sender_id: string;
  message_type: 'dm' | 'comment';
  message_text: string;
  intent: string;
  received_at: string;
  draft_id: number | null;
  draft_text: string | null;
  draft_status: string | null;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/messages')
      .then((r) => r.json())
      .then((d) => setMessages(d.messages))
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header>
        <h1>📬 IG 回覆小幫手</h1>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <Link href="/">收件匣</Link>
        </nav>
      </header>

      <div className="container">
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>收件匣 — 待審草稿</h2>

        {loading && <p>載入中…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && messages.length === 0 && (
          <div className="card">
            <p style={{ textAlign: 'center', color: '#888' }}>目前沒有待審訊息 🎉</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
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

            <p style={{ marginBottom: 8 }}>{msg.message_text}</p>

            {msg.draft_text && (
              <p style={{ background: '#f9f9f9', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#555' }}>
                草稿：{msg.draft_text}
              </p>
            )}

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <Link href={`/thread/${encodeURIComponent(msg.sender_id)}`}>
                <button className="btn-secondary">查看對話串</button>
              </Link>
              {msg.draft_id && (
                <Link href={`/draft/${msg.draft_id}`}>
                  <button className="btn-primary">審稿 / 送出</button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
