import { supabaseAdmin } from "../../../lib/supabaseAdmin";

function requireAdmin(req) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  const auth = req.headers.authorization || "";
  const [type, encoded] = auth.split(" ");
  if (!user || !pass || type !== "Basic" || !encoded) return false;

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [u, p] = decoded.split(":");
  return u === user && p === pass;
}

export default async function handler(req, res) {
  if (!requireAdmin(req)) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin"');
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sb = supabaseAdmin();

  if (req.method === "GET") {
    const { data, error } = await sb
      .from("templates")
      .select("id,title,content,created_at,updated_at")
      .order("updated_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ templates: data || [] });
  }

  if (req.method === "POST") {
    const { id, title, content } = req.body || {};
    if (!id || !title || !content) {
      return res.status(400).json({ error: "id, title, content are required" });
    }

    const { error } = await sb.from("templates").insert([{ id, title, content }]);
    if (error) {
      // duplicate key 常見訊息：duplicate key value violates unique constraint
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
