# workwearyouhoIG

Instagram DM 自動回覆小幫手 — 由 OpenAI 驅動，適用於 WorkWear 品牌的 Instagram 私訊客服。

## 專案架構

```
├── webhook/          # Node.js Webhook 伺服器（接收 Instagram 事件、生成 AI 回覆）
├── admin/            # Next.js 後台管理介面（對話檢視、FAQ 管理）
├── db/               # PostgreSQL Schema（conversations、messages、faqs、ai_logs）
├── ai/               # OpenAI System Prompt 與 Structured Output Schema
├── locales/zh/       # 繁體中文 FAQ 與回覆模板
├── .devcontainer/    # GitHub Codespace / VS Code Dev Container 設定
└── docker-compose.yml
```

## 快速開始（本地開發）

### 前置需求

- Docker & Docker Compose
- Node.js 20+
- Meta Developer 帳號（取得 Instagram Page Access Token）
- OpenAI API Key

### 1. 複製環境變數範本

```bash
cp webhook/.env.example webhook/.env
cp admin/.env.example admin/.env.local
```

編輯 `webhook/.env` 與 `admin/.env.local`，填入你的 API Keys 與資料庫連線字串。

### 2. 啟動服務

```bash
docker compose up -d
```

這會啟動：
- **PostgreSQL** (port 5432) — 自動執行 `db/schema.sql`
- **Webhook 伺服器** (port 3001)
- **Admin 後台** (port 3000)

### 3. 設定 Instagram Webhook

在 [Meta Developer Console](https://developers.facebook.com/) 設定 Webhook URL：

```
https://your-domain.com/webhook
```

Verify Token 與 `webhook/.env` 中的 `IG_VERIFY_TOKEN` 相同。

訂閱事件：`messages`

### 4. 匯入預設 FAQ

開啟瀏覽器前往 [http://localhost:3000/faqs](http://localhost:3000/faqs)，點擊「匯入預設 FAQ」按鈕。

---

## 部署

### Vercel（Admin Dashboard）

1. 在 [vercel.com](https://vercel.com) 新增專案，指向 `admin/` 目錄。
2. 設定環境變數 `DATABASE_URL`（Neon、Supabase 或自建 Postgres）。

### Render（Webhook Server）

1. 在 [render.com](https://render.com) 新增 Web Service，指向 `webhook/` 目錄。
2. Build Command: `npm install`，Start Command: `node src/index.js`。
3. 設定環境變數（參考 `webhook/.env.example`）。

---

## GitHub Codespace 開發

PR 合併後，可直接在 GitHub 介面點選 **Code → Open with Codespaces** 建立開發環境。  
`.devcontainer/devcontainer.json` 已設定好所需服務與 VS Code 延伸套件。

---

## 資料庫 Schema

| 資料表 | 說明 |
|--------|------|
| `conversations` | 每個 Instagram 對話串 |
| `messages` | 每則訊息（inbound / outbound） |
| `faqs` | AI 使用的常見問題知識庫 |
| `reply_templates` | 罐頭回覆模板 |
| `ai_logs` | OpenAI API 呼叫紀錄（用於費用追蹤與除錯）|

---

## 技術棧

- **Webhook**: Node.js + Express
- **Admin**: Next.js 14 (App Router) + Tailwind CSS
- **資料庫**: PostgreSQL 16
- **AI**: OpenAI GPT-4o（Structured Outputs）
- **容器化**: Docker Compose
- **部署**: Vercel + Render（或任何支援 Node.js 的平台）
