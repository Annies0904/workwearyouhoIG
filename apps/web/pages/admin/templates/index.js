import Link from "next/link";
import { useEffect, useState } from "react";

export default function TemplatesIndex() {
  const [templates, setTemplates] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const res = await fetch("/api/admin/templates");
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || `Load failed: ${res.status}`);
      return;
    }
    const data = await res.json();
    setTemplates(data.templates || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Templates</h1>
      <p>
        <Link href="/admin">← Back</Link> |{" "}
        <Link href="/admin/templates/new">+ New</Link>
      </p>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <ul>
        {templates.map((t) => (
          <li key={t.id}>
            {t.title} ({t.id})
          </li>
        ))}
      </ul>
    </main>
  );
}
