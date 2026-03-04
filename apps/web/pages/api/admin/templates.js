import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  // 診斷用：確認此 API route 可正常執行
  if (req.method === "GET" && req.query.__ping === "1") {
    return res.status(200).json({ ok: true, ping: true });
  }

  try {
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
      if (error) return res.status(400).json({ error: error.message });

      return res.status(201).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
