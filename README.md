# Trustworthy AI Hackathon 活動頁

此目錄是一個可移植的靜態活動頁，可併入 chain.tw / Wix 或獨立部署。

## 檔案

- `index.html`：單頁長捲動活動頁，含 SEO / OG meta。
- `styles.css`：自包含樣式，使用 CSS variables 對齊 chain.tw 深藍、白底、時間軸視覺。
- `main.js`：sticky header、手機導覽、語言切換、CTA 狀態、FAQ 渲染與 progressive enhancement。
- `site-config.js`：報名狀態、工作坊數量、聯絡信箱、官方社群與 newsletter 等易變資訊。
- `content.js`：中英文翻譯與完整 FAQ 內容。
- `assets/official/`：chain.tw 既有 TABEI / N24 品牌 logo。
- `assets/og-trustworthy-ai-hackathon.jpg`：1200×630 社群預覽圖。

## 本機預覽

可直接用瀏覽器開啟：

```powershell
Start-Process C:\Users\sanketsu\Hackathon_net\index.html
```

或用任一靜態伺服器預覽：

```powershell
cd C:\Users\sanketsu\Hackathon_net
python -m http.server 8080
```

然後開啟 `http://localhost:8080`。

## 併入 Wix / chain.tw

1. 將 `index.html` 的 `<main>` 內容與對應的 `<header>` / `<footer>` 視需求移入 Wix 自訂頁面。
2. 將 `styles.css` 放入 Wix 的自訂 CSS 或頁面 embed 區塊。
3. 將 `main.js` 放入頁面自訂程式碼區，或改由 Wix 既有互動取代。
4. 將 `assets/` 上傳到 Wix media / public asset 區，並更新 HTML 內的相對路徑。
5. TABEI 與 N24 已使用 chain.tw 既有公開品牌素材；partner logo 仍需待正式授權後再替換目前文字版位。

## 目前設定

- 預設語言：繁體中文。
- 工作坊：4 場賽前工作坊 + 1 次端到端技術彩排。
- 報名：即將開放，未接假表單；後續可在 `site-config.js` 填入 `registrationUrl`。
- Newsletter：使用協會 Substack 連結。

## 合規注意

此第一版已刻意只保留公開活動頁需要的內容，未納入內部營運、未確認合作、後台資料設計或需另行校核的資訊。

合作夥伴皆以文字佔位呈現，並標註「洽談中／擬邀 · In discussion」。
