# 賽後官網更新紀錄

本機預覽：http://127.0.0.1:8080/；得獎名單：http://127.0.0.1:8080/#results；英文：http://127.0.0.1:8080/?lang=en#results。

## 實作

- 得獎名單位於活動單位之後、六大產業命題之前，固定為 `03 / Results`；後續既有編號含隱藏 Finalists 已加一，首頁不再由可見區塊數量覆寫編號。
- `site-config.js` 的 `results` 陣列順序控制五個分組、各得主順序、featured 狀態及 i18n key 引用。資料沒有 feature flag。
- `content.js` 儲存完整繁中、英文文案，正式隊名及人名保持原文。貢獻獎僅列獎項、得主、職稱、說明。
- `main.js` 的 `renderResults(groups, locale, root)` 沿用 `escapeHTML` 處理文字與屬性，並在語言切換時重新渲染。
- `index.html` 提供容器及完整繁中 SEO fallback；`faq.html` 補齊 28 題繁中 fallback。
- 沿用 `prize-grid`、`prize-grid-public`、`prize-grid-conservative`、`prize-card`、`prize-main`。CSS 僅調整長文排列、間距、換行與 Header 響應式行為；既有冠軍標籤改由翻譯後的屬性提供文字，沒有新增色彩。
- Header 移除舊報名狀態及重複 PDF 入口；Hero 保留 PDF 次要按鈕，主要按鈕與手機 CTA 皆指向得獎名單。所有分頁導覽也加入 Results。
- `phase: "post"` 已有正式程式支援；倒數 DOM 移除，`showCountdown: false`，沒有 interval 啟動。即使開啟倒數設定，post 階段仍不啟動。
- 統計列及隱藏舊統計均為 USD 14,000+、20、19、3；特別獎為 2 隊各 USD 1,000，亞軍仍為 2 隊各 USD 2,000。`prizePoolMayIncrease: false`。
- 首頁三項 description metadata 的靜態與動態雙語內容皆已更新；靜態及動態 JSON-LD 依需求使用 `https://schema.org/EventCompleted`。
- 評審與 Mentor 資料、公開 HTML、renderPeople 函式與其樣式保留。舊 Finalists 功能保留。
- README 及規則補充文件的中英文獎項資訊已同步；既有 PDF、品牌圖片及外部字型資源保留，沒有安裝第三方套件。

## 最終 i18n key 清單

以下新增 45 個 key，皆同時存在於 `zh-Hant` 和 `en`：

```text
section.challenge.topics.kicker
section.why.join.kicker
section.roadmap.kicker
section.event.info.kicker
section.eligibility.kicker
section.finalists.kicker
section.judging.kicker
section.network.kicker
section.pre.event.activities.kicker
section.venue.access.kicker
section.faq.kicker
nav.results
event.post.title
event.post.body
event.post.cta
results.kicker
results.title
results.intro
results.outro
results.each
results.winner.humanId.name
results.winner.humanId.description
results.winner.buluanpay.name
results.winner.buluanpay.description
results.winner.carbonTrio.name
results.winner.carbonTrio.description
results.winner.localKing.name
results.winner.localKing.description
results.winner.stableBook.name
results.winner.stableBook.description
results.winner.newJeans.name
results.winner.newJeans.description
results.winner.blocks.name
results.winner.blocks.description
results.winner.angel.name
results.winner.angel.description
results.contribution.award
results.contribution.name
results.contribution.role
results.contribution.description
prize.special.count
statband.demoDayTeams
stat.demoDayTeams.count
stat.days.count
stat.prize.count
```

更新的既有 key：

```text
meta.description
statband.prize
statband.teams
statband.days
rules.download
prize.body
prize.special.amount
stat.teams.count
stat.teams
```

Results 重用的既有獎项 key（獎金與獎項不重複定義）：

```text
prize.grand.title
prize.grand.amount
prize.runner.title
prize.runner.amount
prize.third.title
prize.third.amount
prize.special.title
```

`prize.special.amount` 同時被 Results 與獎項區塊重用。刪除的 key 為 `prize.total.note`。
FAQ 使用原有 `FAQ_GROUPS["zh-Hant"]`／`FAQ_GROUPS.en` 結構，已同步更新「獎項有哪些？」／「What are the prizes?」。

## 驗證與預覽

```powershell
python -m http.server 8080 --bind 127.0.0.1
node --test tests/post-event.test.cjs
node --check main.js
node --check content.js
node --check site-config.js
git diff --check

# 使用工作站原有 Playwright，不在專案安裝套件
$env:NODE_PATH = 'C:/Users/sanketsu/.codex-playwright/node_modules'
node tests/post-event-browser.cjs
```

已通過 4 項 Node 測試，以及 1440、1024、820、768、390、375、320px 的繁中→英文→繁中瀏覽器檢查，包含：

- 五組九張卡片、八個獎金欄位、正式名稱與特殊字元 escaping。
- 所有 HTML i18n 引用都能解析；過期獎項文案已移除。
- 選單關閉、Results 錨點與固定 Header 遮擋檢查。
- 無水平溢出、無 JavaScript pageerror、沒有倒數 interval。
- 語言切換同步更新卡片、導覽、Hero 與三項 description。
- 保留 Finalists 開啟後的渲染功能及固定編號；Results 不受獎項設定影響。
- 停用 JavaScript 時仍可讀取完整得獎名單及 28 題 FAQ。
- 評審、Mentor 資料與公開 HTML、renderPeople 函式對照 Git HEAD 保持一致（忽略 CRLF/LF 差異）。

桌機及手機截圖保留於本機 `artifacts/post-event-results-{1440,390}-{zh-Hant,en}.png` 與 `artifacts/post-event-hero-{1440,390}-{zh-Hant,en}.png`，不納入程式碼提交。既有 artifacts 保留。
發布方式：提交後推送至 `https://github.com/zuemen/Hackathon_net` 的 `main` 分支。正式網站更新狀態以部署結果為準。
