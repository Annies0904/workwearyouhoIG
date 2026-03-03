# workwearyouhoIG — IG 回覆小幫手 MVP

> 半自動 Instagram DM / 留言回覆系統，結合 OpenAI 意圖分類與草稿生成，搭配後台審稿 UI，讓品牌帳號高效管理顧客訊息。

---

## 📦 專案結構

```
workwearyouhoIG/
├── packages/
│   ├── webhook/          # Node.js Webhook Server（接收 IG 事件）
│   ├── admin/            # Next.js 後台 UI（Inbox / Thread / Draft 審稿）
│   ├── db/               # Postgres 資料表 Schema
│   └── kb/               # 知識庫（FAQ + zh 回覆模板）
│       ├── faq.md
│       └── templates/
│           ├── pricing.md
│           ├── availability.md
│           ├── product_info.md
│           ├── complaint.md
│           └── general.md
└── README.md
```

---

## ✨ 功能清單

| 功能 | 說明 |
|------|------|
| IG DM Webhook | 接收 Instagram 私訊事件，自動分類意圖並生成草稿 |
| IG 留言 Webhook | 接收 Instagram 留言事件，生成簡短引導私訊/LINE 的草稿 |
| 意圖分類 | OpenAI GPT 將訊息分類為 pricing / availability / product_info / complaint / general / spam |
| 草稿生成 | 依意圖與回覆類型（DM/留言）生成繁體中文草稿 |
| 風險審核 | OpenAI 審核草稿是否包含不當承諾、敏感資訊等風險 |
| 後台收件匣 | 顯示所有待審草稿訊息 |
| 對話串 | 查看同一發送者的完整訊息歷史 |
| 草稿審核與送出 | 人工修改草稿 → 風險審核 → 一鍵送出至 IG |
| zh 回覆模板 | 6 類 18 個繁體中文標準模板（`packages/kb/templates/`） |
| FAQ | 完整常見問題集（`packages/kb/faq.md`） |

---

## 🚀 部署設定

### 雲端架構建議

| 服務 | 平台 |
|------|------|
| Next.js 後台 UI (`packages/admin`) | [Vercel](https://vercel.com) |
| Node.js Webhook Server (`packages/webhook`) | [Render](https://render.com) (Web Service) |
| Postgres 資料庫 | [Render](https://render.com) (PostgreSQL) |

---

### 1. 資料庫初始化（Render Postgres）

1. 在 Render 建立 PostgreSQL 服務
2. 取得 `DATABASE_URL`（格式：`postgresql://user:password@host:5432/dbname`）
3. 執行初始化 Schema：
   ```bash
   psql $DATABASE_URL -f packages/db/schema.sql
   ```

---

### 2. Webhook Server 部署（Render Web Service）

1. 在 Render 建立 Web Service，指定 Root Directory 為 `packages/webhook`
2. Build Command：`npm install`
3. Start Command：`node src/index.js`
4. 設定以下環境變數（見下方「必須環境變數」）
5. 部署後取得 URL，例如 `https://your-webhook.onrender.com`

---

### 3. Next.js 後台部署（Vercel）

1. 在 Vercel 匯入此 repo
2. 設定 Root Directory 為 `packages/admin`
3. Framework Preset 選 **Next.js**
4. 設定以下環境變數（見下方「必須環境變數」）

---

### 4. IG Webhook 設定（Meta Developer Console）

1. 前往 [Meta for Developers](https://developers.facebook.com) → 你的 App
2. 進入 **Webhooks** → **Instagram** → 新增訂閱
3. **Callback URL**：`https://your-webhook.onrender.com/webhook`
4. **Verify Token**：與 `INSTAGRAM_VERIFY_TOKEN` 環境變數相同
5. 訂閱欄位：`messages`（DM）、`comments`（留言）
6. 確認驗證通過後儲存

---

## 🔑 必須環境變數

### `packages/webhook/.env`

| 變數名 | 說明 |
|--------|------|
| `INSTAGRAM_VERIFY_TOKEN` | Webhook 驗證 token（自訂字串，需與 Meta Console 一致） |
| `INSTAGRAM_APP_SECRET` | Meta App 的 App Secret（用於驗證 webhook 簽名） |
| `INSTAGRAM_PAGE_ACCESS_TOKEN` | IG 頁面存取 Token（用於送出回覆） |
| `OPENAI_API_KEY` | OpenAI API 金鑰 |
| `OPENAI_MODEL` | OpenAI 模型，預設 `gpt-4o-mini` |
| `DATABASE_URL` | Postgres 連線字串 |
| `PORT` | Server 監聽埠，預設 `3001` |

複製範本：
```bash
cp packages/webhook/.env.example packages/webhook/.env
```

### `packages/admin/.env.local`

| 變數名 | 說明 |
|--------|------|
| `DATABASE_URL` | Postgres 連線字串（同上） |
| `INSTAGRAM_PAGE_ACCESS_TOKEN` | IG 頁面存取 Token（用於後台送出回覆） |
| `OPENAI_API_KEY` | OpenAI API 金鑰（用於後台風險審核） |
| `OPENAI_MODEL` | OpenAI 模型，預設 `gpt-4o-mini` |
| `NEXT_PUBLIC_BASE_URL` | 後台 URL，本地為 `http://localhost:3000` |

複製範本：
```bash
cp packages/admin/.env.example packages/admin/.env.local
```

> ⚠️ **安全提醒**：所有敏感設定均透過環境變數管理，請勿將 `.env` 或 `.env.local` 提交至版本控制。

---

## 💻 本地開發

### 前置需求
- Node.js 18+
- PostgreSQL（本地或 Render）
- npm 7+（支援 workspaces）

### 安裝依賴
```bash
npm install
```

### 啟動 Webhook Server
```bash
npm run dev:webhook
# 監聽 http://localhost:3001
```

### 啟動後台 UI
```bash
npm run dev:admin
# 開啟 http://localhost:3000
```

### 測試 Webhook（本地）
使用 [ngrok](https://ngrok.com) 建立臨時公開 URL：
```bash
ngrok http 3001
```
將 ngrok URL + `/webhook` 填入 Meta Developer Console。

---

## 🧪 測試驗收流程

### 1. Webhook 驗證測試
```bash
curl "http://localhost:3001/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"
# 應回傳 test123
```

### 2. Health Check
```bash
curl http://localhost:3001/health
# 應回傳 {"status":"ok","timestamp":"..."}
```

### 3. 模擬 DM 事件
```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "id": "PAGE_ID",
      "messaging": [{
        "sender": {"id": "USER_123"},
        "recipient": {"id": "PAGE_ID"},
        "timestamp": 1700000000000,
        "message": {
          "mid": "MSG_001",
          "text": "請問這件衣服多少錢？"
        }
      }]
    }]
  }'
# 應回傳 200 OK，並在資料庫建立訊息與草稿記錄
```

> 注意：本地測試跳過 webhook 簽名驗證（`INSTAGRAM_APP_SECRET` 未設定時）

### 4. 後台 UI 驗收
1. 開啟 `http://localhost:3000`
2. 確認收件匣顯示剛才的模擬訊息
3. 點擊「審稿 / 送出」進入草稿頁面
4. 點擊「🔍 風險審核」確認 OpenAI 風險分析回傳
5. 確認「📤 送出回覆」按鈕功能正常（需設定有效的 `INSTAGRAM_PAGE_ACCESS_TOKEN`）

### 5. 對話串驗收
1. 在收件匣點擊「查看對話串」
2. 確認同一 sender 的所有訊息按時序顯示

---

## 📚 知識庫（packages/kb）

### FAQ 檔案
- `packages/kb/faq.md` — 常見問題集（價格、庫存、運送、退換貨等）

### zh 回覆模板檔案

| 檔案 | 類別 | 模板數量 |
|------|------|---------|
| `templates/pricing.md` | 價格詢問 | 3 DM + 3 留言 = 6 個 |
| `templates/availability.md` | 庫存詢問 | 3 DM + 3 留言 = 6 個 |
| `templates/product_info.md` | 商品資訊 | 3 DM + 3 留言 = 6 個 |
| `templates/complaint.md` | 客訴/退換貨 | 4 DM + 3 留言 = 7 個 |
| `templates/general.md` | 一般問候 | 3 DM + 3 留言 = 6 個 |

**合計：31 個繁體中文回覆模板**

---

## 🏗️ OpenAI Prompt 設計

### 意圖分類（Intent Classification）
- 輸入：原始訊息文字
- 輸出：單一標籤（`pricing` / `availability` / `product_info` / `complaint` / `general` / `spam`）
- 溫度：0（確定性輸出）

### 草稿生成（Draft Generation）
- 根據意圖標籤選擇對應策略
- DM 回覆：詳細友善
- 留言回覆：≤30 字，結尾引導私訊或 LINE
- 溫度：0.7（適度創意）

### 風險審核（Risk Review）
- 輸入：草稿文字
- 輸出：`{"safe": true/false, "reason": "..."}`
- 檢查項目：具體承諾、敏感資訊、不當用語、誤導性宣稱

---

## 📄 授權

MIT License
