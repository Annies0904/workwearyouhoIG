import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Draft {
  id: number;
  draft_text: string;
  status: string;
  risk_safe: boolean | null;
  risk_reason: string | null;
  message_text: string;
  intent: string;
  message_type: string;
  sender_id: string;
}

export default function DraftPage() {
  const router = useRouter();
  const { draftId } = router.query as { draftId: string };

  const [draft, setDraft] = useState<Draft | null>(null);
  const [editedText, setEditedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [riskLoading, setRiskLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!draftId) return;
    fetch(`/api/drafts?draftId=${draftId}`)
      .then((r) => r.json())
      .then((d) => {
        setDraft(d.draft);
        setEditedText(d.draft?.draft_text || '');
      })
      .finally(() => setLoading(false));
  }, [draftId]);

  async function runRiskCheck() {
    if (!draft) return;
    setRiskLoading(true);
    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftText: editedText, draftId: draft.id }),
      });
      const data = await res.json();
      setDraft((prev) => prev ? { ...prev, risk_safe: data.safe, risk_reason: data.reason } : prev);
    } finally {
      setRiskLoading(false);
    }
  }

  async function updateStatus(status: string) {
    if (!draft) return;
    setActionLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/drafts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: draft.id, status, draftText: editedText }),
      });
      if (!res.ok) throw new Error('Failed');
      setDraft((prev) => prev ? { ...prev, status, draft_text: editedText } : prev);
      setMessage(`✅ 狀態已更新為 ${status}`);
    } catch {
      setMessage('❌ 操作失敗');
    } finally {
      setActionLoading(false);
    }
  }

  async function sendDraft() {
    if (!draft) return;
    setActionLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: draft.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDraft((prev) => prev ? { ...prev, status: 'sent' } : prev);
      setMessage('✅ 已成功送出回覆！');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessage(`❌ 送出失敗：${errMsg}`);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="container"><p>載入中…</p></div>;
  if (!draft) return <div className="container"><p>找不到草稿</p></div>;

  const isSent = draft.status === 'sent';
  const isRejected = draft.status === 'rejected';

  return (
    <>
      <header>
        <Link href="/">← 返回收件匣</Link>
        <h1 style={{ marginLeft: 12 }}>草稿審核</h1>
      </header>

      <div className="container" style={{ maxWidth: 720 }}>
        {/* Original message */}
        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span className={`badge badge-${draft.message_type}`}>
              {draft.message_type === 'dm' ? '📩 DM' : '💬 留言'}
            </span>
            <span className="intent-tag">{draft.intent}</span>
            <span style={{ marginLeft: 'auto' }}>
              <span className={`badge badge-${draft.status}`}>{draft.status}</span>
            </span>
          </div>
          <p className="meta" style={{ marginBottom: 4 }}>來自：{draft.sender_id}</p>
          <p>{draft.message_text}</p>
        </div>

        {/* Draft editor */}
        <div className="card">
          <h3 style={{ marginBottom: 10, fontSize: 15 }}>AI 草稿回覆</h3>
          <textarea
            rows={5}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            disabled={isSent || isRejected}
          />

          {/* Risk check result */}
          {draft.risk_safe !== null && (
            <p style={{ marginTop: 8, fontSize: 13 }} className={draft.risk_safe ? 'risk-ok' : 'risk-warn'}>
              {draft.risk_safe ? '✅ 風險審核通過' : `⚠️ 風險警告：${draft.risk_reason}`}
            </p>
          )}

          {message && (
            <p style={{ marginTop: 8, fontSize: 13 }}>{message}</p>
          )}

          {/* Actions */}
          {!isSent && !isRejected && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                onClick={runRiskCheck}
                disabled={riskLoading || actionLoading}
              >
                {riskLoading ? '審核中…' : '🔍 風險審核'}
              </button>
              <button
                className="btn-success"
                onClick={sendDraft}
                disabled={actionLoading || draft.risk_safe === false}
                title={draft.risk_safe === false ? '風險審核未通過，無法送出' : ''}
              >
                {actionLoading ? '處理中…' : '📤 送出回覆'}
              </button>
              <button
                className="btn-danger"
                onClick={() => updateStatus('rejected')}
                disabled={actionLoading}
              >
                🗑️ 拒絕草稿
              </button>
            </div>
          )}

          {isSent && (
            <p style={{ marginTop: 12, color: '#38a169', fontWeight: 500 }}>✅ 此回覆已送出</p>
          )}
          {isRejected && (
            <p style={{ marginTop: 12, color: '#e53e3e', fontWeight: 500 }}>❌ 此草稿已被拒絕</p>
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <Link href={`/thread/${encodeURIComponent(draft.sender_id)}`}>
            查看完整對話串 →
          </Link>
        </div>
      </div>
    </>
  );
}
