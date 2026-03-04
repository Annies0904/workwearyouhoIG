export default function handler(req, res) {
  res.status(200).json({ ok: true, route: "/api/admin/__mw", ts: Date.now() });
}
