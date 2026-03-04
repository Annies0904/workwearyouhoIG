import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "templates.json");

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

function readData() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export default function handler(req, res) {
  if (!requireAdmin(req)) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin"');
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    return res.status(200).json(readData());
  }

  if (req.method === "POST") {
    const { id, title, content } = req.body || {};
    if (!id || !title || !content) {
      return res.status(400).json({ error: "id, title, content are required" });
    }
    const data = readData();
    if (data.templates.some((t) => t.id === id)) {
      return res.status(409).json({ error: "id already exists" });
    }
    data.templates.push({ id, title, content });
    writeData(data);
    return res.status(201).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed (for MVP only GET/POST)" });
}
