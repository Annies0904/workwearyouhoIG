# workwearyouhoIG

## 部署目標 / Deployment Target

**正確的目標 Repository：** `Annies0904/workwearyouhoIG`

所有部署指令、PR 任務、CI/CD 工作流程及協助作業均應指向本 repository：
`https://github.com/Annies0904/workwearyouhoIG`

All deployment commands, pull request tasks, CI/CD workflows, and assistance operations must target this repository:
`https://github.com/Annies0904/workwearyouhoIG`

> ⚠️ **重要提醒 / Important Notice**
> 請勿將任何資源或變更推送至舊 repository（`quoteapp_yh01`）。
> Do **not** push any resources or changes to the old repository (`quoteapp_yh01`).

## 確認清單 / Verification Checklist

- [x] 主要程式碼已推送至 `Annies0904/workwearyouhoIG`
- [x] CI/CD 工作流程指向 `Annies0904/workwearyouhoIG`
- [x] PR 任務目標為 `Annies0904/workwearyouhoIG`
- [x] 協助作業已切換至 `Annies0904/workwearyouhoIG`
- [x] 不再於 `quoteapp_yh01` 執行任何操作

---

## 刪除部署 / Teardown

如需完全移除整個部署（容器、網路、資料庫 Volume 及本地映像檔），請執行：

To completely remove the entire deployment (containers, networks, database volumes, and locally-built images), run:

```bash
bash teardown.sh
```

也可以使用 `--dry-run` 旗標先預覽將要執行的指令，不會實際刪除任何東西：

Use the `--dry-run` flag to preview the commands without executing them:

```bash
bash teardown.sh --dry-run
```

或者，若想手動逐步操作，可直接執行以下 Docker Compose 指令：

Alternatively, to perform the steps manually:

```bash
# 停止並移除容器、網路、具名 Volume（資料庫資料）及本地映像檔
# Stop and remove containers, networks, named volumes (database data), and locally-built images
docker compose down --volumes --remove-orphans --rmi local
```

> ⚠️ **警告 / Warning**
> 執行上述指令後，**所有資料庫資料將永久刪除**，且無法復原。請先備份重要資料。
> After running the above command, **all database data will be permanently deleted** and cannot be recovered. Back up any important data first.
