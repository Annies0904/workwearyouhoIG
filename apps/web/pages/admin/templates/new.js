import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function NewTemplate() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, content }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || `Create failed: ${res.status}`);
      return;
    }
    router.push("/admin/templates");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>New Template</h1>
      <p>
        <Link href="/admin/templates">← Back</Link>
      </p>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <label>
          ID (英文/數字/短字串)
          <input value={id} onChange={(e) => setId(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            style={{ width: "100%" }}
          />
        </label>
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
