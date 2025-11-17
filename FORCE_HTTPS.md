# Force HTTPS 設定指南

## ✅ 已完成的設定

### 1. netlify.toml 中的配置

已新增以下設定：

#### HTTP 到 HTTPS 強制重定向
```toml
[[redirects]]
  from = "http://claude-poster.luka.tw/*"
  to = "https://claude-poster.luka.tw/:splat"
  status = 301
  force = true
```

#### HSTS (HTTP Strict Transport Security)
```toml
Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

這會告訴瀏覽器：
- 未來 1 年內永遠使用 HTTPS
- 包含所有子網域
- 可以被加入 HSTS Preload List

#### 其他安全標頭
- `X-Frame-Options`: 防止點擊劫持
- `X-Content-Type-Options`: 防止 MIME 類型混淆
- `X-XSS-Protection`: XSS 保護
- `Referrer-Policy`: 控制 Referrer 資訊
- `Permissions-Policy`: 限制瀏覽器功能權限

---

## 🔧 在 Netlify 儀表板啟用 HTTPS

### 步驟 1：啟用 HTTPS

前往 Netlify Domain 設定：
```
https://app.netlify.com/sites/claude-poster/settings/domain
```

在 **HTTPS** 區塊：

1. **Netlify SSL/TLS certificate**
   - 確認狀態是 "Active" 或點擊 "Verify DNS configuration"
   - Netlify 會自動提供免費的 Let's Encrypt SSL 憑證

2. **Force HTTPS**
   - ✅ 勾選 "Force HTTPS" 或 "Automatically redirect to HTTPS"
   - 這會在 Netlify 層級強制重定向

### 步驟 2：等待 SSL 憑證生效

- 第一次設定可能需要幾分鐘到幾小時
- 憑證會自動更新，無需手動操作
- Netlify 會在憑證到期前自動續期

---

## 📋 完整的 HTTPS 保護層級

現在你有 **三層** HTTPS 保護：

### 第 1 層：Netlify 儀表板設定
- 在 Domain Settings 勾選 "Force HTTPS"

### 第 2 層：netlify.toml 重定向
- HTTP 流量自動重定向到 HTTPS (301)

### 第 3 層：HSTS 標頭
- 瀏覽器記住永遠使用 HTTPS
- 防止中間人攻擊

---

## ✅ 測試 HTTPS

### 測試重定向

```bash
# 測試 HTTP 是否重定向到 HTTPS
curl -I http://claude-poster.luka.tw

# 應該看到：
# HTTP/1.1 301 Moved Permanently
# Location: https://claude-poster.luka.tw/
```

### 測試 HTTPS

```bash
# 測試 HTTPS 是否正常
curl -I https://claude-poster.luka.tw

# 應該看到：
# HTTP/2 200
# strict-transport-security: max-age=31536000; includeSubDomains; preload
```

### 在瀏覽器測試

1. 訪問 `http://claude-poster.luka.tw`（HTTP）
2. 應該自動跳轉到 `https://claude-poster.luka.tw`（HTTPS）
3. 網址列應該顯示 🔒 鎖頭圖示

---

## 🔍 驗證 SSL 憑證

### 線上工具

1. **SSL Labs**
   ```
   https://www.ssllabs.com/ssltest/analyze.html?d=claude-poster.luka.tw
   ```
   - 檢查 SSL 配置品質
   - 目標：A 或 A+ 評級

2. **Security Headers**
   ```
   https://securityheaders.com/?q=https://claude-poster.luka.tw
   ```
   - 檢查安全標頭設定
   - 目標：A 或 A+ 評級

### 瀏覽器檢查

1. 在 Chrome/Firefox 中訪問網站
2. 點擊網址列的 🔒 圖示
3. 查看憑證詳細資訊
4. 確認：
   - 憑證由 Let's Encrypt 簽發
   - 憑證有效期內
   - 憑證包含正確的網域名稱

---

## 🚀 部署更新

提交並推送變更：

```bash
git add netlify.toml
git commit -m "Add force HTTPS and security headers"
git push origin main
```

Netlify 會自動部署，約 1 分鐘後生效。

---

## 🐛 故障排除

### SSL 憑證無法生成

1. 確認 DNS 設定正確
   - CNAME 指向 `claude-poster.netlify.app`
   - Proxy status 是 "DNS only"（灰色雲朵）

2. 在 Netlify 重新驗證 DNS
   - Domain Settings → Verify DNS configuration

3. 等待 DNS 完全傳播（可能需要幾小時）

### HTTPS 重定向不生效

1. 清除瀏覽器快取
2. 使用無痕模式測試
3. 等待 Netlify 部署完成（約 1-2 分鐘）
4. 檢查 netlify.toml 語法是否正確

### Mixed Content 警告

如果頁面有 HTTP 資源：

1. 確保所有圖片、CSS、JS 都用 HTTPS 或相對路徑
2. 檢查第三方資源是否支援 HTTPS
3. 在瀏覽器 Console 查看詳細錯誤

---

## 🎯 最佳實踐

### 已實施 ✅

- ✅ 自動 HTTPS 重定向
- ✅ HSTS 標頭（1 年）
- ✅ 安全標頭（XSS、Clickjacking 保護等）
- ✅ Let's Encrypt 免費 SSL 憑證
- ✅ 自動憑證更新

### 進階選項（可選）

- 🔹 加入 HSTS Preload List
  - 訪問：https://hstspreload.org/
  - 提交你的網域
  - 瀏覽器會內建 HSTS 設定

- 🔹 Content Security Policy (CSP)
  - 如果需要更嚴格的安全政策
  - 可以在 netlify.toml 添加 CSP 標頭

---

## 📊 安全評級目標

配置完成後，應該達到：

- **SSL Labs**: A 或 A+ ⭐
- **Security Headers**: A 或 A+ ⭐
- **Mozilla Observatory**: A 或 A+ ⭐

---

## 🎉 完成

你的網站現在：
- ✅ 強制使用 HTTPS
- ✅ 有完整的 SSL 加密
- ✅ 受到多層安全標頭保護
- ✅ 自動更新 SSL 憑證
- ✅ 符合現代 Web 安全標準

訪問 https://claude-poster.luka.tw 享受安全連線！🔒
