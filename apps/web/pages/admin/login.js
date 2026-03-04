import { useMemo, useState } from "react";
import { useRouter } from "next/router";

export default function AdminLoginPage() {
  const router = useRouter();
  const nextPath = useMemo(() => {
    const n = router.query.next;
    return typeof n === "string" && n.startsWith("/") ? n : "/admin/templates";
  }, [router.query.next]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Login failed");
      window.location.href = nextPath;
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "64px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Admin Login</h1>

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 10 }}
            autoComplete="username"
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ width: "100%", padding: 10 }}
            autoComplete="current-password"
          />
        </label>

        {err ? <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div> : null}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
