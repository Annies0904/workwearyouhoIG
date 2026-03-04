# workwearyouhoIG

此專案的所有程式碼、PR 推送、部署設定（Vercel / Render）均指向本倉庫：

**`Annies0904/workwearyouhoIG`**

## 確認事項

| 項目 | 狀態 | 說明 |
|------|------|------|
| Git remote origin | ✅ 正確 | `https://github.com/Annies0904/workwearyouhoIG` |
| PR 推送目標 | ✅ 正確 | 僅推送至 `Annies0904/workwearyouhoIG` |
| Vercel 部署 | ⚠️ 待確認 | 請確認 Vercel 專案已連結至 `Annies0904/workwearyouhoIG` |
| Render 部署 | ⚠️ 待確認 | 請確認 Render 服務已連結至 `Annies0904/workwearyouhoIG` |
| 與 quoteapp_yh01 的關係 | ✅ 無關聯 | 本倉庫與 `quoteapp_yh01` 完全獨立，無共用設定 |

## Vercel 設定步驟

若要確認或重新連結 Vercel 至本倉庫：

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 進入對應的 Project → **Settings** → **Git**
3. 確認 **Connected Git Repository** 顯示為 `Annies0904/workwearyouhoIG`
4. 若顯示其他倉庫（如 `quoteapp_yh01`），點選 **Disconnect** 後重新連結正確倉庫

## Render 設定步驟

若要確認或重新連結 Render 至本倉庫：

1. 登入 [Render Dashboard](https://dashboard.render.com/)
2. 進入對應的 Service → **Settings**
3. 確認 **Repository** 欄位顯示為 `Annies0904/workwearyouhoIG`
4. 若顯示其他倉庫（如 `quoteapp_yh01`），需刪除現有 service 並重新建立，選擇正確倉庫
