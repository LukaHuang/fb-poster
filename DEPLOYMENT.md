# GitHub Actions 自動部署設定

## ✅ 已完成的設定

1. **GitHub Actions Workflow** (`.github/workflows/gh-pages.yml`)
   - 當 push 到 `main` 分支時自動觸發
   - 自動安裝依賴、建置並部署到 GitHub Pages
   - **不再需要手動執行 `npm run deploy`**

2. **Vite 配置** (`vite.config.js`)
   - Base path: `/fb-poster/`
   - 支援自訂網域

3. **自訂網域** (`public/CNAME`)
   - 網域: `tool.luka.tw`

## 🚀 啟用步驟

### 1. 在 GitHub Repository 設定中啟用 GitHub Pages

前往你的 GitHub repository：
```
https://github.com/LukaHuang/fb-poster/settings/pages
```

設定以下選項：
- **Source**: GitHub Actions（選擇 "GitHub Actions" 而非 "Deploy from a branch"）
- **Custom domain**: `tool.luka.tw`
- **Enforce HTTPS**: ✅ 勾選

> ⚠️ **重要**：必須選擇 "GitHub Actions" 作為 Source，不要選擇 "Deploy from a branch"

### 2. 設定 DNS（如果尚未設定）

在你的 DNS 供應商（如 Cloudflare）新增：

**CNAME 記錄（推薦）**
```
Type: CNAME
Name: tool
Value: lukahuang.github.io
Proxy: 可開可關
```

或 **A 記錄**
```
Type: A
Name: tool
Value: 
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
```

### 3. Push 到 main 分支觸發自動部署

```bash
git add .
git commit -m "Add i18n support and GitHub Actions deployment"
git push origin main
```

推送後，GitHub Actions 會自動開始建置和部署流程。

### 4. 查看部署狀態

前往 Actions 頁面查看部署進度：
```
https://github.com/LukaHuang/fb-poster/actions
```

你會看到 "Deploy to GitHub Pages" workflow 正在執行。

## 🎉 完成

部署完成後，你的網站將在以下網址可用：
- **自訂網域**: https://tool.luka.tw/fb-poster
- **GitHub Pages 預設網址**: https://lukahuang.github.io/fb-poster

## 📝 工作流程說明

### 統一使用 main 分支部署

現在的部署流程已統一：
1. **開發時**：在 `main` 分支上工作
2. **部署時**：push 到 `main` 分支
3. **自動化**：GitHub Actions 自動建置並部署到 GitHub Pages
4. **分支結構**：
   - `main` - 主要開發分支（手動管理）
   - `gh-pages` - 部署分支（GitHub Actions 自動管理）

### 不再需要的操作

❌ ~~`npm run deploy`~~ （已移除此指令）
❌ ~~手動建置並推送到 gh-pages 分支~~
❌ ~~安裝 gh-pages 套件~~（可選擇性移除）

### 每次更新的步驟

```bash
# 1. 修改代碼
# 2. 提交變更
git add .
git commit -m "Your commit message"

# 3. 推送到 main（自動觸發部署）
git push origin main

# 4. 查看 Actions 頁面確認部署狀態
# https://github.com/LukaHuang/fb-poster/actions
```

## 🔧 本地開發

```bash
# 開發模式
npm run dev

# 本地建置測試
npm run build

# 預覽建置結果
npm run preview
```

## 🗑️ 清理舊的部署方式（可選）

如果你想完全移除舊的手動部署方式：

```bash
# 移除 gh-pages 套件（可選）
npm uninstall gh-pages

# 刪除遠端的 gh-pages 分支（小心操作！）
# git push origin --delete gh-pages
```

> ⚠️ 注意：刪除 gh-pages 分支前，請確保 GitHub Actions 部署已經正常運作！

## 🐛 故障排除

### 如果部署失敗

1. 檢查 Actions 日誌：https://github.com/LukaHuang/fb-poster/actions
2. 確認 GitHub Pages 設定中 Source 為 "GitHub Actions"
3. 確認 Permissions 設定正確（workflow 檔案中已包含）
4. 確認 build 指令在本地可以正常執行：`npm run build`

### 如果自訂網域無法訪問

1. 檢查 DNS 設定是否正確
2. 等待 DNS 傳播（可能需要幾分鐘到幾小時）
3. 確認 `public/CNAME` 檔案內容正確
4. 在 GitHub Pages 設定中重新輸入自訂網域並儲存

