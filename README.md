# Trustworthy AI Hackathon 活動頁

此目錄是一個可移植的靜態活動頁，可併入 chain.tw / Wix 或獨立部署。

## 檔案

- `index.html`：單頁長捲動活動頁，含 SEO / OG meta。
- `styles.css`：自包含樣式，使用 CSS variables 對齊 chain.tw 深藍、白底、時間軸視覺。
- `main.js`：sticky header、手機導覽、語言切換狀態、scroll reveal、訂閱欄位佔位互動。
- `assets/`：TABEI / N24 logo 佔位與 OG 圖。

## 本機預覽

可直接用瀏覽器開啟：

```powershell
Start-Process C:\Users\sanketsu\trustworthy-ai-hackathon\index.html
```

或用任一靜態伺服器預覽：

```powershell
cd C:\Users\sanketsu\trustworthy-ai-hackathon
python -m http.server 8080
```

然後開啟 `http://localhost:8080`。

## 併入 Wix / chain.tw

1. 將 `index.html` 的 `<main>` 內容與對應的 `<header>` / `<footer>` 視需求移入 Wix 自訂頁面。
2. 將 `styles.css` 放入 Wix 的自訂 CSS 或頁面 embed 區塊。
3. 將 `main.js` 放入頁面自訂程式碼區，或改由 Wix 既有互動取代。
4. 將 `assets/` 上傳到 Wix media / public asset 區，並更新 HTML 內的相對路徑。
5. 待正式授權後，再以正式 TABEI / N24 / partner logo 取代目前的文字佔位圖。

## 合規注意

此第一版已刻意只保留公開活動頁需要的內容，未納入內部營運、未確認合作、後台資料設計或需另行校核的資訊。

合作夥伴皆以文字佔位呈現，並標註「洽談中／擬邀 · In discussion」。
