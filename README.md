# Trustworthy AI Hackathon 活動頁

此目錄是一個可移植的靜態活動頁，可併入 chain.tw / Wix 或獨立部署。公開版採「只公布已確認資訊」原則。

## 檔案

- `index.html`：首頁 Landing Board，集中呈現主視覺、獎金、快速入口、評審、Mentor、重要時程、工作坊與活動單位。
- `challenges.html`：六大產業命題完整內容與命題錨點（`#01`–`#06`）。
- `guide.html`：時間軸、活動流程、參賽資格、交件、評分與場地資訊。
- `faq.html`：中英文完整常見問答。
- `workshops/`：8/15、8/22 工作坊講者分頁。
- `styles.css`：自包含樣式，沿用 TABEI / chain.tw 深藍綠、青綠與白色品牌視覺。
- `main.js`：sticky header、手機導覽、語言切換、CTA 狀態、Event JSON-LD、FAQ 渲染與 progressive enhancement。
- `site-config.js`：活動日期、人數、報名狀態、feature flags、聯絡信箱、社群與 newsletter 等易變資訊。
- `content.js`：中英文翻譯與完整 FAQ 內容。
- `assets/official/`：chain.tw 既有 TABEI / N24 品牌 logo。
- `assets/og-trustworthy-ai-hackathon.jpg`：1200×630 社群預覽圖。

## 本機預覽

```powershell
cd C:\Users\sanketsu\Hackathon_net
python -m http.server 8080
```

然後開啟 `http://localhost:8080`。

## 目前設定

- 預設語言：繁體中文。
- 活動日期：2026/08/29–08/31。
- 地點：N24 台北方舟。
- 50 隊報名、20 隊入選、19 隊完成 Demo Day 發表。
- 每隊：3–5 人。
- 活動已於 2026/08/31 結束；首頁直接顯示五組得獎名單。
- 報名：已於 2026/08/05 23:59（GMT+8）截止。
- 報名與組隊流程已結束；歷史規則保留在參賽指南與 FAQ。
- 每位參賽者限加入一隊。
- 產業命題：主辦方與產業夥伴共同命題共 6 題；網站僅預告題名與核心問題，完整命題於入選後工作坊公布。
- 工作坊：2026/08/15 14:00–16:00 線上、2026/08/22 10:30–11:00 報到、11:00–16:00 線下實體。
- 賽後版的 `registrationUrl` 為 `null`，首頁主要入口改為得獎名單。
- 組隊媒合於賽前工作坊進行，網站不再提供外部媒合平台連結。
- 公開總獎金池為 USD 14,000+；冠軍 1 隊 USD 5,000、亞軍 2 隊各 USD 2,000、季軍 3 隊各 USD 1,000、特別獎 2 隊各 USD 1,000。可信 AI 治理創新貢獻獎未提供獎金資料，省略金額。
- 未確認夥伴、資源、硬體、VC 活動流程與工作坊細節均不公開；六題命題的完整背景與方向提示亦不提前公開。

## 待辦

- [ ] 比賽辦法 PDF（中／英）需依六題產業命題制重新輸出。
  - 題目與賽道章節：由「自由發想／參考方向」改為「六題產業命題制」。
  - 報名階段：參賽者提出自訂痛點與解法構想，僅作為書面初審依據。
  - 入選階段：完整命題於入選後工作坊公布，入選者依正式命題進行開發。
- [ ] 比賽辦法 PDF（中／英）獎項章節仍是舊版總額，需由主辦方更新為 USD 14,000 起並納入特別獎。

## CTA 狀態

賽後版使用 `phase: "post"`、`showCountdown: false`、`prizePoolMayIncrease: false`。Header 與 Hero 顯示賽後狀態，主要 CTA 指向 `#results`；倒數 DOM 已移除，也不啟動 interval。

`site-config.js` 的 `results` 陣列控制分組、順序、featured 狀態及文字 key；所有雙語內容在 `content.js`，由 `main.js` 的 `renderResults(groups, locale, root)` 渲染。得獎名單不受 feature flag 控制。詳細 key 清單與驗證方式見 [賽後更新紀錄](docs/post-event-update.md)。

`registrationStatus` 與 `registrationOverride` 維持 `closed`，`challengeRevealScheduleEnabled` 維持 `false`。

## Feature Flags

`site-config.js` 內保留以下開關；未確認內容維持 `false`，避免提早公開。GLEIF 已確認為合作夥伴，因此 `showPartnerNames` 目前為 `true`：

- `showPrizeBreakdown`（目前為 `true`）
- `showWinnerCount`
- `showBuilderKit`
- `showHardwarePrizes`
- `showPartnerNames`（目前為 `true`；GLEIF 已確認）
- `showCredentialExperience`
- `showWorkshopTopics`
- `showMentors`（目前為 `true`）
- `showWorkshopSpeakers`（目前為 `true`；控制工作坊講者分頁及首頁卡片連結）

日後若獎項、資源、硬體、夥伴、VC 流程或工作坊主題正式確認，先補齊內容與中英文翻譯，再打開對應 flag。

## 併入 Wix / chain.tw

1. 將 `index.html` 的 `<main>` 內容與對應的 `<header>` / `<footer>` 視需求移入 Wix 自訂頁面。
2. 將 `styles.css` 放入 Wix 的自訂 CSS 或頁面 embed 區塊。
3. 將 `site-config.js`、`content.js`、`main.js` 依序放入頁面自訂程式碼區。
4. 將 `assets/` 上傳到 Wix media / public asset 區，並更新 HTML 內的相對路徑。
5. 夥伴 logo、講者、評審、硬體、開發資源與 VC 流程需待正式確認後再公開。

## 合規注意

公開頁只保留已確認活動資訊。未簽約或未定案的合作單位、贊助、講師、評審、Challenge Owner、硬體、開發資源、VC 流程與工作坊主題不得以既定事實呈現。
