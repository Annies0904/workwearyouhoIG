export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return res.status(500).json({ error: "Admin credentials are not configured" });
  }

  const { username, password } = req.body || {};
  if (username !== user || password !== pass) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const maxAge = 60 * 60 * 24 * 7; // 7 days
  res.setHeader(
    "Set-Cookie",
    `admin_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`
  );

  return res.status(200).json({ ok: true });
}
