# Trustworthy AI Hackathon 活動頁

此目錄是一個可移植的靜態活動頁，可併入 chain.tw / Wix 或獨立部署。公開版採「只公布已確認資訊」原則。

## 檔案

- `index.html`：單頁長捲動活動頁，含 SEO / OG / Twitter meta 與 Event JSON-LD fallback。
- `styles.css`：自包含樣式，沿用 TABEI / chain.tw 深藍綠、青綠與白色品牌視覺。
- `main.js`：sticky header、手機導覽、語言切換、CTA 狀態、Event JSON-LD、FAQ 渲染與 progressive enhancement。
- `site-config.js`：活動日期、人數、報名狀態、報名網址、feature flags、聯絡信箱、社群與 newsletter 等易變資訊。
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
- 正式入選：20 隊。
- 每隊：3–5 人。
- 預計參賽者：60–100 人。
- 報名：完整隊伍報名，由 Team Lead 代表提交。
- 不接受個人報名或跨賽道投件。
- 每位參賽者限加入一隊。
- 賽道：4 個，每隊只能選擇一個賽道。
- 工作坊：兩場，日期為 2026/08/15、2026/08/22。
- 報名已於 7/8 正式開放，8/5 截止。
- 報名網址已填入 `site-config.js`：`https://forms.gle/CbJgpMaTh3GzgzUL8`。
- 公開主現金獎金池為 USD 12,000 起，冠軍 USD 5,000、亞軍 2 隊各 USD 2,000、季軍 3 隊各 USD 1,000；其他特別獎與開發資源以正式公告為準。
- 未確認夥伴、資源、硬體、VC 活動流程與工作坊細節均不公開。

## CTA 狀態

`main.js` 會依 `site-config.js` 的台灣時區時間判斷報名 CTA：

- 2026/07/08 前：中文 `即將開放報名`，英文 `Applications Opening Soon`。
- 2026/07/08 至 2026/08/05 23:59:59：中文 `立即報名`，英文 `Apply Now`，連到 Google Forms。
- 2026/08/05 23:59:59 後：中文 `報名已截止`，英文 `Registration Closed`。

目前已在 `site-config.js` 將 `registrationOverride` 設為 `open`，讓報名 CTA 直接連到 Google Forms。臨時需要提前或延後開關時，可設定為 `scheduled`、`open` 或 `closed`。

## Feature Flags

`site-config.js` 內保留以下開關，預設皆為 `false`，避免未確認內容被公開：

- `showPrizeBreakdown`
- `showWinnerCount`
- `showBuilderKit`
- `showHardwarePrizes`
- `showPartnerNames`
- `showCredentialExperience`
- `showWorkshopTopics`

日後若獎項、資源、硬體、夥伴、VC 流程或工作坊主題正式確認，先補齊內容與中英文翻譯，再打開對應 flag。

## 併入 Wix / chain.tw

1. 將 `index.html` 的 `<main>` 內容與對應的 `<header>` / `<footer>` 視需求移入 Wix 自訂頁面。
2. 將 `styles.css` 放入 Wix 的自訂 CSS 或頁面 embed 區塊。
3. 將 `site-config.js`、`content.js`、`main.js` 依序放入頁面自訂程式碼區。
4. 將 `assets/` 上傳到 Wix media / public asset 區，並更新 HTML 內的相對路徑。
5. 夥伴 logo、講者、評審、硬體、開發資源與 VC 流程需待正式確認後再公開。

## 合規注意

公開頁只保留已確認活動資訊。未簽約或未定案的合作單位、贊助、講師、評審、Challenge Owner、硬體、開發資源、VC 流程與工作坊主題不得以既定事實呈現。
