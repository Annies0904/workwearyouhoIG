import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "templates.json");

function requireAdmin(req, res) {
  // 因為你已用 middleware Basic Auth 保護 /admin
  // 但 /api 不會自動被保護，所以這裡也要檢查 Authorization
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  const auth = req.headers.authorization || "";
  const [type, encoded] = auth.split(" ");
  if (!user || !pass || type !== "Basic" || !encoded) return false;

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const [u, p] = decoded.split(":");
  return u === user && p === pass;
}

function readData() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export default function handler(req, res) {
  if (!requireAdmin(req, res)) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin"');
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const data = readData();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { id, title, content } = req.body || {};
    if (!id || !title || !content) {
      return res.status(400).json({ error: "id, title, content are required" });
    }

    const data = readData();
    const exists = data.templates.some((t) => t.id === id);
    if (exists) return res.status(409).json({ error: "id already exists" });

    data.templates.push({ id, title, content });
    writeData(data);
    return res.status(201).json({ ok: true });
  }

  if (req.method === "PUT") {
    const { id, title, content } = req.body || {};
    if (!id || !title || !content) {
      return res.status(400).json({ error: "id, title, content are required" });
    }

    const data = readData();
    const idx = data.templates.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ error: "not found" });

    data.templates[idx] = { id, title, content };
    writeData(data);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "id is required" });

    const data = readData();
    const next = data.templates.filter((t) => t.id !== id);
    if (next.length === data.templates.length) {
      return res.status(404).json({ error: "not found" });
    }

    data.templates = next;
    writeData(data);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
