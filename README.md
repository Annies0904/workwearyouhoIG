# workwearyouhoIG — IG 回覆小幫手 MVP

> 半自動 Instagram DM / 留言回覆系統，結合 OpenAI 意圖分類與草稿生成，搭配後台審稿 UI，讓品牌帳號高效管理顧客訊息。

---

## ✅ PR 狀態確認 / PR Status Report

| PR | 標題 | 狀態 | 包含元件 |
|----|------|------|----------|
| [#1](https://github.com/Annies0904/workwearyouhoIG/pull/1) | feat: IG auto-reply assistant MVP (Node.js + Next.js) | 🟡 **已推送，尚未 merged** | Node.js Webhook、Next.js Pages Router 後台、Postgres schema、OpenAI prompts、FAQ (MD)、zh 模板 (5 categories) |
| [#2](https://github.com/Annies0904/workwearyouhoIG/pull/2) | Add IG Reply Helper system + upgrade Next.js to 15.5.12 | 🟡 **已推送，尚未 merged** | Node.js Webhook (含測試)、Next.js App Router 後台、Postgres schema、OpenAI schema、FAQ/zh 模板 (JSON)、Docker Compose、DevContainer |

### 📋 已推送元件清單

| 元件 | PR#1 | PR#2 |
|------|------|------|
| **Node.js Webhook server**（IG DM / 留言接收、X-Hub-Signature-256 驗證）| ✅ `packages/webhook/` | ✅ `webhook/` |
| **Next.js 後台 UI**（收件匣、訊息串、草稿審稿/送出）| ✅ `packages/admin/` | ✅ `admin/` |
| **Postgres schema**（messages、drafts、templates、faq 等資料表）| ✅ `packages/db/schema.sql` | ✅ `db/schema.sql` |
| **OpenAI prompt**（意圖分類、草稿生成、風險審核）| ✅ `packages/webhook/src/prompts/` | ✅ `ai/prompts/system.md` |
| **OpenAI 回覆 JSON schema** | — | ✅ `ai/schemas/reply.json` |
| **FAQ 知識庫** | ✅ `packages/kb/faq.md` | ✅ `locales/zh/faq.json` (13 筆) |
| **zh 回覆模板**（定價、庫存、商品、投訴、一般）| ✅ `packages/kb/templates/*.md` (5 類) | ✅ `locales/zh/templates.json` (7 筆) |
| **Docker Compose 本地開發環境** | — | ✅ `docker-compose.yml` |
| **DevContainer / Codespace 設定** | — | ✅ `.devcontainer/devcontainer.json` |
| **Webhook 單元測試** | — | ✅ `webhook/src/__tests__/webhook.test.js` |

### 🔴 尚未 Merge

**兩個 PR 均尚未 merged 至 `main` 分支。**

建議採用 **PR#2**（更完整，含 Docker、測試、App Router、CVE 修補），或由專案負責人審閱後決定合併哪個版本。

---

## 📦 專案結構（以 PR#2 為準）

```
workwearyouhoIG/
├── webhook/                # Node.js/Express Webhook Server（PORT 3001）
│   ├── src/
│   │   ├── index.js        # 入口點
│   │   ├── middleware/verify.js  # X-Hub-Signature-256 驗證
│   │   ├── routes/webhook.js     # GET 驗證 / POST 事件處理
│   │   └── services/
│   │       ├── openai.js   # 意圖分類 + 草稿生成
│   │       ├── instagram.js # Graph API 傳送回覆
│   │       └── database.js  # Postgres 存取
│   └── src/__tests__/      # Jest 單元測試
├── admin/                  # Next.js 15 App Router 後台（PORT 3000）
│   └── src/app/
│       ├── page.tsx         # 首頁/儀表板
│       ├── conversations/   # 對話列表
│       ├── faqs/            # FAQ 管理
│       └── api/             # 後端 API routes
├── db/
│   └── schema.sql           # Postgres 建表 DDL
├── ai/
│   ├── prompts/system.md    # OpenAI system prompt 模板
│   └── schemas/reply.json   # 結構化回覆 JSON schema
├── locales/zh/
│   ├── faq.json             # 13 筆繁體中文 FAQ
│   └── templates.json       # 7 筆 zh 回覆模板
├── docker-compose.yml       # 本地開發一鍵啟動（Postgres + webhook + admin）
└── .devcontainer/           # GitHub Codespace 設定
```

---

## 🚀 部署指南

### 前置需求

- Node.js 18+
- PostgreSQL 15+（本地或 Render）
- Meta Developer App（Instagram Graph API + Webhook）
- OpenAI API Key

### 方案 A：本地 Docker 開發（最快，PR#2）

```bash
# 1. clone 並切換至 feature 分支（PR merge 前）
git clone https://github.com/Annies0904/workwearyouhoIG.git
cd workwearyouhoIG
git checkout copilot/push-ig-reply-helper-code

# 2. 複製並填入環境變數
cp webhook/.env.example webhook/.env
cp admin/.env.example admin/.env.local
# 編輯這兩個檔案，填入 OPENAI_API_KEY、META_APP_SECRET 等

# 3. 啟動所有服務
docker compose up --build

# 服務就緒後：
#   Admin UI  → http://localhost:3000
#   Webhook   → http://localhost:3001/webhook
#   Postgres  → localhost:5432
```

### 方案 B：雲端部署（Vercel + Render）

#### 1. Postgres — Render

1. 至 [Render Dashboard](https://dashboard.render.com/) 建立 **PostgreSQL** 服務
2. 建立完成後，取得 **Internal Database URL**
3. 在 Render 主控台執行 `db/schema.sql`：
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```

#### 2. Webhook Server — Render Web Service

1. 至 Render 建立 **Web Service**，選擇 `webhook/` 目錄
2. **Build Command**：`npm install`
3. **Start Command**：`node src/index.js`
4. 設定以下環境變數：

   | 變數 | 說明 |
   |------|------|
   | `META_APP_SECRET` | Meta App Dashboard → App Secret |
   | `META_VERIFY_TOKEN` | 自訂字串，與 Meta Webhook 設定一致 |
   | `OPENAI_API_KEY` | OpenAI Platform API Key |
   | `DATABASE_URL` | Render Postgres Internal URL |
   | `IG_PAGE_ACCESS_TOKEN` | Meta Business Suite → Access Token |
   | `PORT` | `3001`（預設） |

5. 部署後取得 Webhook URL：`https://<your-render-app>.onrender.com/webhook`

#### 3. Admin UI — Vercel

1. 至 [Vercel](https://vercel.com/) 匯入此 repo，**Root Directory** 設為 `admin`
2. 設定以下環境變數：

   | 變數 | 說明 |
   |------|------|
   | `DATABASE_URL` | Render Postgres External URL |
   | `OPENAI_API_KEY` | OpenAI API Key |
   | `NEXTAUTH_SECRET` | 隨機字串（用於 session 加密） |

3. 部署完成後取得 Admin URL

#### 4. Meta Webhook 設定

1. 至 [Meta Developer Console](https://developers.facebook.com/) → 你的 App → **Webhooks**
2. 新增 **Instagram** Webhook：
   - **Callback URL**：`https://<your-render-app>.onrender.com/webhook`
   - **Verify Token**：填入 `META_VERIFY_TOKEN` 的值
3. 訂閱 `messages` 和 `comments` 事件

---

## ✅ 測試驗收指引

### 1. Webhook 驗證測試

```bash
# 驗證 GET 請求（Meta 訂閱時使用）
curl "https://<webhook-url>/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=<META_VERIFY_TOKEN>"
# 預期回應：test123
```

### 2. 模擬 DM 事件（Webhook POST）

```bash
# 產生正確簽名的測試請求（需替換 APP_SECRET 與 payload）
PAYLOAD='{"object":"instagram","entry":[{"messaging":[{"sender":{"id":"123"},"message":{"text":"請問有哪些尺寸？"}}]}]}'
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$META_APP_SECRET" | awk '{print $2}')
curl -X POST https://<webhook-url>/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIG" \
  -d "$PAYLOAD"
# 預期：200 OK，Postgres 中新增一筆 conversation/message
```

### 3. 後台 UI 測試

1. 開啟 Admin URL
2. 確認 **Conversations** 頁面顯示剛才的測試訊息
3. 確認 AI 草稿已生成（`ai_logs` 資料表）
4. 測試回覆送出功能

### 4. 執行單元測試（PR#2）

```bash
cd webhook
npm install
npm test
# 預期：所有 Jest 測試通過
```

---

## 🔐 環境變數彙整

### webhook/.env

```env
META_APP_SECRET=your_meta_app_secret
META_VERIFY_TOKEN=your_custom_verify_token
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:pass@host:5432/dbname
IG_PAGE_ACCESS_TOKEN=your_page_access_token
PORT=3001
```

### admin/.env.local

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
OPENAI_API_KEY=sk-...
NEXTAUTH_SECRET=your_random_secret
```

---

## 📋 PR 審查建議

在 merging PR 前，建議負責人確認以下項目：

- [ ] **PR#2** 的 Next.js 版本已升級至 15.5.12（修補多個 CVE）
- [ ] 所有環境變數均已透過 Vercel / Render 環境變數設定，未硬寫於程式碼
- [ ] Webhook `X-Hub-Signature-256` 簽名驗證邏輯正確（raw body，非 re-serialized JSON）
- [ ] Postgres schema 已在生產 DB 執行
- [ ] Meta Webhook 訂閱已設定並驗證通過
- [ ] 單元測試全數通過（`cd webhook && npm test`）

---

## ⚠️ 部署注意事項

- **PR 尚未 merged**：若要在 main 分支部署，請先合併 PR#1 或 PR#2。若要在 merged 前進行測試，可直接 checkout feature branch 部署。
- **建議優先採用 PR#2**：含有 Docker Compose、單元測試、CVE 修補（Next.js 14.2.3 → 15.5.12）。
- **不要在同一 Repo 同時合併 PR#1 和 PR#2**：兩者結構不同，合併其中一個即可。
- **Render Free Tier 冷啟動**：若 Webhook Server 長時間無流量，首次收到 Meta Webhook 可能因冷啟動延遲而逾時，建議使用 Render 付費方案或設定 uptime robot 保持活躍。
