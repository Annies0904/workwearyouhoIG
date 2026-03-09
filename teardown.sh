#!/usr/bin/env bash
# teardown.sh — Completely remove the entire Docker Compose deployment.
# 完全移除整個 Docker Compose 部署。
#
# Usage / 用法:
#   bash teardown.sh            # stop containers, remove containers/networks/volumes/images
#   bash teardown.sh --dry-run  # preview the commands without executing them

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

run() {
  if $DRY_RUN; then
    echo "[dry-run] $*"
  else
    echo "▶ $*"
    "$@"
  fi
}

echo "========================================"
echo " Teardown: workwearyouhoIG deployment"
echo " 刪除部署：workwearyouhoIG"
echo "========================================"
echo ""

# Stop and remove containers, networks, named volumes (database data), and locally-built images.
# 停止並移除容器、網路、具名 Volume（資料庫資料）及本地建置的映像檔。
run docker compose down --volumes --remove-orphans --rmi local

echo ""
echo "✅ Deployment fully removed. / 部署已完全移除。"
echo ""
echo "To verify nothing is left, run:"
echo "  docker compose ps"
echo ""
echo "If you also want to remove ALL unused Docker resources globally, run:"
echo "  docker system prune -af --volumes"
