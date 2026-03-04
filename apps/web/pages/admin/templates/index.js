import Link from "next/link";
import { useEffect, useState } from "react";

export default function TemplatesIndex() {
  const [templates, setTemplates] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const res = await fetch("/api/admin/templates");
    if (!res.ok) {
      setErr(`Load failed: ${res.status}`);
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
            <Link href={`/admin/templates/${encodeURIComponent(t.id)}`}>
              {t.title} ({t.id})
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
