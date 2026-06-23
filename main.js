(function () {
  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".site-nav a");
  const langButtons = document.querySelectorAll("[data-lang-button]");
  const translatableItems = document.querySelectorAll("[data-zh][data-en]");
  const forms = document.querySelectorAll("[data-form]");
  const textMap = new Map([
    ["跳到主要內容", "Skip to main content"],
    ["開啟選單", "Open menu"],
    ["流程", "Format"],
    ["賽道", "Tracks"],
    ["規則", "Rules"],
    ["獎項", "Prizes"],
    ["夥伴", "Partners"],
    ["報名 Coming Soon", "Registration Coming Soon"],
    ["可信 AI 黑客松", "Trustworthy AI Hackathon"],
    ["當 AI Agent 開始代表人或組織執行任務，身份、授權、行動邊界與追溯機制必須被清楚設計。", "When AI Agents start acting for people or organizations, identity, authorization, action boundaries and auditability must be clearly designed."],
    ["兩天一夜黑客松＋第三日 Demo Day", "2-day / 1-night hackathon + Demo Day"],
    ["報名即將開放 / Stay Tuned", "Registration Coming Soon / Stay Tuned"],
    ["技術棧自由，信任要求明確", "Stack freedom, clear trust requirements"],
    ["Principal 代表誰", "Principal: who is represented"],
    ["Authorization 被授權做什麼", "Authorization: what is allowed"],
    ["Policy Gate 高風險動作如何被擋", "Policy Gate: how high-risk actions are blocked"],
    ["Audit Log 如何追溯行動", "Audit Log: how actions are traceable"],
    ["為什麼是現在", "Why Now"],
    ["AI Agent 的信任缺口，不能只靠更好的回答品質解決。", "The trust gap around AI Agents cannot be solved only by improving answer quality."],
    ["當 AI Agent 開始代替人決定、查詢、下單、送件或簽署時，風險不再只是模型答錯，而是可能發生越權操作、個資外洩、責任不明、授權無法撤銷，或無法證明某個行動由誰授意。", "When AI Agents start deciding, querying, ordering, filing or signing on behalf of people, the risk is no longer just an incorrect answer. The real risks include unauthorized actions, personal-data leakage, unclear responsibility, non-revocable authorization and the inability to prove who instructed a given action."],
    ["它代表誰？", "Who does it represent?"],
    ["被授權做什麼？", "What is it authorized to do?"],
    ["授權何時失效？", "When does authorization expire?"],
    ["哪些動作需人類確認？", "Which actions require human approval?"],
    ["出事後如何追溯與問責？", "How can incidents be traced and accounted for?"],
    ["活動定位", "What It Is"],
    ["一場以可信 AI Agent 為核心的高密度 builder program。", "A focused builder program centered on trustworthy AI Agents."],
    ["兩天一夜實作", "2-day / 1-night build"],
    ["從入選隊伍進入現場開發，完成可運作原型與 Demo Day 中文簡報。", "Selected teams build on site and deliver a working prototype plus a Chinese Demo Day presentation."],
    ["20 隊混合組隊", "20 mixed teams"],
    ["學生、業界開發者與領域專家共同實作，兼顧技術能力與場景理解。", "Students, industry developers and domain experts work together, balancing technical execution with scenario understanding."],
    ["治理缺口 memo", "Governance gap memo"],
    ["每隊交付一頁台灣落地治理缺口 memo，成為後續白皮書素材。", "Each team submits a one-page memo on Taiwan deployment governance gaps as input for white-paper work."],
    ["週末實作到 POC", "Weekend build to POC"],
    ["把可信 Agent 原型、場景問題與合作管線接到後續 POC 討論。", "Connect trustworthy Agent prototypes, scenario problems and partner pipelines to follow-on POC discussions."],
    ["形式與規模／三日流程", "Format, Scale & Three-day Flow"],
    ["公開頁面只呈現參賽者需要知道的流程重點。", "This public page presents only participant-facing flow highlights."],
    ["入選隊伍", "selected teams"],
    ["每隊人數", "people per team"],
    ["預計參賽者", "expected participants"],
    ["落地賽道", "tracks"],
    ["賽前工作坊", "pre-event workshops"],
    ["主獎得主", "main prize winners"],
    ["開幕與組隊確認", "Kickoff and team confirmation"],
    ["報到、夥伴出題、活動規則說明與組隊確認。", "Check-in, partner challenges, rules briefing and team confirmation."],
    ["實作與交件", "Build and submit"],
    ["Build sprint、mentor office hours、收尾與正式交件。", "Build sprint, mentor office hours, finalization and formal submission."],
    ["成果簡報與頒獎", "Demo and awards"],
    ["中文成果簡報、評審、頒獎與完賽 VC。", "Chinese demos, judging, awards and Completion VC."],
    ["四大賽道", "Four Tracks"],
    ["One backbone, four scenarios. 每個作品都需回應具體場景中的可信問題。", "One backbone, four scenarios. Every project should address a concrete trust problem in context."],
    ["供應鏈與貿易金融", "Supply Chain & Trade Finance"],
    ["電商與第三方支付", "E-commerce & Third-party Payments"],
    ["醫療保險", "Health & Insurance"],
    ["政府服務", "Government Services"],
    ["場景痛點", "Scenario pain point"],
    ["核心可信問題", "Core trust question"],
    ["示例 POC", "Example POC"],
    ["供應商資格、訂單融資、ESG／碳資料可信度。", "Supplier qualification, order financing and trustworthiness of ESG / carbon data."],
    ["Agent 是否代表採購人／法人？能否讀取供應商憑證、草擬訂單，但禁止自行付款？", "Does the Agent represent a purchaser or legal entity? Can it read supplier credentials and draft orders while being blocked from making payments?"],
    ["供應商資格 VC、訂單即融資證明、ESG／碳盤查選擇性揭露、採購 Agent 授權。", "Supplier qualification VC, order-as-financing proof, selective ESG / carbon disclosure and procurement Agent authorization."],
    ["高頻代購、支付授權、反詐騙、資格驗證。", "High-frequency purchasing, payment authorization, anti-fraud and eligibility verification."],
    ["Agent 是否僅能比價與建立付款意向？何時必須由本人確認？", "Can the Agent only compare prices and create payment intent? When must the person confirm?"],
    ["Agent 代購授權、商家可信驗證、年齡／資格選擇性揭露、付款前 human approval。", "Agent purchasing authorization, merchant trust verification, age / eligibility selective disclosure and human approval before payment."],
    ["高敏感個資、理賠、同意與核保稽核。", "Highly sensitive personal data, claims, consent and underwriting audit."],
    ["Agent 可以讀取哪些醫療資料？是否有有效 consent？送件前如何確認？", "Which medical data can the Agent read? Is there valid consent? How is filing confirmed before submission?"],
    ["理賠資料可信交換、同意 VC、隱私保護下聯合分析、AI 核保 action log。", "Trusted claims data exchange, consent VC, privacy-preserving federated analysis and AI underwriting action log."],
    ["公部門憑證、跨部會、代辦與國際互認。", "Public-sector credentials, cross-agency processes, delegated filing and international recognition."],
    ["Agent 可以代填、代查或代送到何種程度？哪些動作需本人確認？", "How far can an Agent fill, query or submit on someone's behalf? Which actions require personal confirmation?"],
    ["公部門憑證升級 VC、Agent 代辦申請、資格驗證、跨境互認概念。", "Public-sector credential upgrade VC, Agent-assisted applications, eligibility verification and cross-border recognition concepts."],
    ["共同主軸「信任地基」", "Trust Foundation"],
    ["所有賽道都需處理 identity · authorization · verification · privacy · security · accountability。", "Every track must address identity · authorization · verification · privacy · security · accountability."],
    ["代表誰？Agent 代表哪一個人、團隊、法人或公部門單位。", "Who is represented? Which person, team, legal entity or public-sector unit does the Agent represent?"],
    ["被授權做什麼？誰授權、允許做什麼、禁止做什麼。", "What is authorized? Who authorizes it, what is allowed and what is forbidden?"],
    ["能呼叫什麼工具？每個工具需要哪些權限與邊界。", "What tools can it call? What permissions and boundaries does each tool require?"],
    ["高風險動作如何被擋？付款、送件、簽署或讀取敏感資料需明確把關。", "How are high-risk actions blocked? Payments, filing, signing or reading sensitive data require explicit gates."],
    ["如何追溯行動？記錄 Agent 的行動、決策與授權依據。", "How are actions traced? Record the Agent's actions, decisions and authorization basis."],
    ["何時失效或撤銷？授權過期或撤銷後，Agent 必須停止執行。", "When does it expire or get revoked? After expiry or revocation, the Agent must stop executing."],
    ["單純 chatbot 包裝不足以拿高分。作品應展示 Agent 在明確信任限制下完成真實任務，且能被驗證、限制、追溯。", "A simple chatbot wrapper is not enough for a high score. Projects should show an Agent completing a real task under explicit trust constraints, with verification, limitation and traceability."],
    ["參賽資格與規則", "Eligibility & Rules"],
    ["鼓勵跨校、跨公司、跨技術與領域組隊。", "Cross-school, cross-company, cross-technical and domain teams are encouraged."],
    ["參賽對象", "Who can participate"],
    ["學生、青年開發者與業界開發者。", "Students, young developers and industry developers."],
    ["AI／資料、資安、區塊鏈、產品、設計或專案管理人才。", "AI / data, security, blockchain, product, design or project-management talent."],
    ["供應鏈、支付、醫療保險、政府服務等領域參與者。", "Participants from supply chain, payments, health insurance and government services."],
    ["隊伍與出席", "Team and attendance"],
    ["每隊 2-5 人，每位參賽者限加入一隊。", "Each team has 2-5 people. Each participant may join only one team."],
    ["可個人報名，再由主辦方協助媒合。", "Individuals may register first and be matched by the organizer."],
    ["入選隊伍需完整參與 8/29-31 主要流程。", "Selected teams must participate in the main 8/29-31 program."],
    ["交付與注意事項", "Deliverables and notes"],
    ["需完成 demo、中文簡報與一頁治理缺口 memo。", "Teams must complete a demo, a Chinese presentation and a one-page governance gap memo."],
    ["僅使用具合法授權的模型、資料、工具與第三方服務。", "Use only legally authorized models, data, tools and third-party services."],
    ["敏感資料以匿名、合成或測試資料替代，並遵守 sponsor 使用規範。", "Replace sensitive data with anonymized, synthetic or test data, and follow sponsor usage rules."],
    ["評分標準", "Judging Criteria"],
    ["初選重視題目相關性；決選聚焦信任設計、技術完成度與場景適配。", "Initial screening prioritizes topic relevance; final judging focuses on trust design, technical completion and scenario fit."],
    ["初選評估", "Initial screening"],
    ["題目相關性", "Topic relevance"],
    ["可行性", "Feasibility"],
    ["團隊能力", "Team capability"],
    ["決選評估", "Final evaluation"],
    ["信任架構", "Trust architecture"],
    ["技術執行", "Technical execution"],
    ["場景適配", "Scenario fit"],
    ["獎項與開發資源", "Prizes & Builder Resources"],
    ["主現金獎、Builder Kit、四大賽道獎與選配特別獎。", "Main cash prizes, Builder Kits, Best Track Awards and optional special awards."],
    ["主現金獎池，分配給 6 隊主獎得主。", "Main cash prize pool for 6 winning teams."],
    ["冠軍 Grand Prize：1 x USD 5,000", "Grand Prize: 1 x USD 5,000"],
    ["亞軍 Excellence Award：2 x USD 2,000", "Excellence Award: 2 x USD 2,000"],
    ["季軍 Merit Award：3 x USD 1,000", "Merit Award: 3 x USD 1,000"],
    ["20 隊入選皆有", "For all 20 selected teams"],
    ["含 OpenAI、Gemini、Claude Code 等開發資源，以隊伍為單位分段發放。", "Includes OpenAI, Gemini, Claude Code and other builder resources, released by team in stages."],
    ["四大賽道獎", "Best Track Awards"],
    ["硬體以 Mac mini 為目標；以贊助到位為準 / subject to sponsor confirmation。", "Hardware target: Mac mini; subject to sponsor confirmation."],
    ["選配特別獎", "Optional special award"],
    ["DGX Spark 等列為選配特別獎；以贊助到位為準 / subject to sponsor confirmation。", "DGX Spark and similar items are optional special awards, subject to sponsor confirmation."],
    ["憑證體驗（VC）作為亮點", "Credential Experience as a Highlight"],
    ["用於活動流程，但不綁死參賽技術棧。", "Used for event operations, without locking teams into a required development stack."],
    ["入選", "Selected"],
    ["報到", "Check-in"],
    ["隊伍", "Team"],
    ["交件", "Submit"],
    ["完賽", "Complete"],
    ["得獎", "Award"],
    ["活動以可驗證憑證串接關鍵節點；KERI、vLEI 與政府錢包可作為鼓勵或進階場景，不是所有隊伍的硬性門檻。", "The event uses verifiable credentials to connect key milestones. KERI, vLEI and government wallets are encouraged or advanced scenarios, not mandatory requirements for all teams."],
    ["賽前工作坊", "Pre-event Workshops"],
    ["協助入選隊伍建立共同語言與技術起點。", "Helping selected teams build a shared vocabulary and technical starting point."],
    ["VC／DID 與活動憑證流程", "VC / DID and event credential flow"],
    ["理解入選、報到、交件、完賽與得獎證明如何串接活動流程。", "Understand how selected, check-in, submission, completion and award credentials connect to the event flow."],
    ["KERI／vLEI 與可信授權", "KERI / vLEI and trustworthy authorization"],
    ["聚焦法人、組織角色、Agent 委派授權與可撤銷的信任流程。", "Focus on legal entities, organizational roles, Agent delegated authorization and revocable trust flows."],
    ["時間軸", "Roadmap"],
    ["從框架對齊到 Hackathon＋Demo Day。", "From framework alignment to Hackathon + Demo Day."],
    ["6 月", "June"],
    ["框架與夥伴對齊", "Framework and partner alignment"],
    ["7 月初", "Early July"],
    ["正式公告、開放報名", "Public launch and registration opens"],
    ["7 月中", "Mid July"],
    ["說明會與組隊媒合", "Info session and team matching"],
    ["7 月下旬", "Late July"],
    ["初選與入選確認", "Screening and selected-team confirmation"],
    ["8 月", "August"],
    ["賽前工作坊與技術彩排", "Pre-event workshops and technical rehearsal"],
    ["8/29-31", "8/29-31"],
    ["Hackathon＋Demo Day", "Hackathon + Demo Day"],
    ["合作夥伴與生態系", "Partners & Ecosystem"],
    ["實際角色以正式邀請與合作確認為準 / Roles confirmed through formal invitation and partner alignment.", "Roles confirmed through formal invitation and partner alignment."],
    ["技術夥伴 Technology Partners", "Technology Partners"],
    ["開發社群 Developer Communities", "Developer Communities"],
    ["指導單位 Guidance", "Guidance"],
    ["洽談中／擬邀 · In discussion", "In discussion"],
    ["成為夥伴／徵求贊助", "Become a Partner"],
    ["把品牌放在可信 AI Agent 生態系的根部。", "Put your brand at the root of the trustworthy AI Agent ecosystem."],
    ["直接觸及學生與業界開發者人才。", "Direct access to mixed student and industry builders."],
    ["參與形塑台灣可信 AI 白皮書與採用。", "Help shape Taiwan's trustworthy-AI white paper and adoption."],
    ["透過國際夥伴、政府指導與媒體取得品牌露出。", "Visibility through international partners, government guidance and media."],
    ["接觸可於賽後續接的原型與 POC。", "Engage prototypes and POCs after the event."],
    ["聯絡我們 taka@chain.tw", "Contact us: taka@chain.tw"],
    ["常見問答", "FAQ"],
    ["報名前可先確認資格、交付與規則。", "Confirm eligibility, deliverables and rules before registration opens."],
    ["誰可以參加？", "Who can participate?"],
    ["學生、青年開發者、業界開發者、設計／產品人才，以及四大賽道相關領域參與者皆可報名。", "Students, young developers, industry developers, design / product talent and participants from the four track domains may register."],
    ["需要什麼背景？", "What background do I need?"],
    ["活動鼓勵跨領域組隊。隊伍可包含開發、AI／資料、資安、區塊鏈、產品、設計、專案管理或領域專家。", "Cross-disciplinary teams are encouraged. Teams may include development, AI / data, security, blockchain, product, design, project management or domain expertise."],
    ["可以個人報名嗎？", "Can I register as an individual?"],
    ["可以。個人可先報名，再由主辦方協助媒合；最終隊伍需為 2-5 人。", "Yes. Individuals may register first and be matched by the organizer. Final teams must have 2-5 people."],
    ["簡報語言是什麼？", "What is the presentation language?"],
    ["Demo Day 以中文簡報與現場成果展示為主，技術名稱、程式碼與專有名詞可使用英文。", "Demo Day uses Chinese presentations and live demos. Technical names, code and terms may be in English."],
    ["可以用哪些技術棧？", "What technology stacks are allowed?"],
    ["程式語言、模型、Agent framework、wallet、DID method、雲端或本地端環境皆可自由選擇；信任成果必須能被展示。", "Teams may choose any programming language, model, Agent framework, wallet, DID method, cloud or local environment. Trust outcomes must be demonstrable."],
    ["需要交什麼？", "What must teams submit?"],
    ["需完成可運作 demo、中文簡報與一頁台灣落地治理缺口 memo，並展示 Agent workflow、授權模型、工具行動與 audit trail。", "Teams must submit a working demo, Chinese presentation and one-page Taiwan governance gap memo, and show Agent workflow, authorization model, tool action and audit trail."],
    ["智財與資料規則如何處理？", "How are IP and data rules handled?"],
    ["作品若使用既有程式或開源套件，應揭露並符合授權。敏感資料一律以匿名、合成或測試資料替代。", "Existing code or open-source packages must be disclosed and comply with their licenses. Sensitive data must be replaced with anonymized, synthetic or test data."],
    ["報名何時開放？", "When will registration open?"],
    ["報名即將開放。可在本頁留下 email 訂閱搶先通知。", "Registration is coming soon. Leave an email on this page for early updates."],
    ["報名／聯絡", "Registration & Contact"],
    ["報名即將開放 Coming Soon。", "Registration is coming soon."],
    ["訂閱搶先通知", "Subscribe for early updates"],
    ["此欄位為前端佔位，不會送出真實表單。", "This is a front-end placeholder and does not submit a real form."],
    ["聯絡窗口", "Contact"],
    ["回 chain.tw 主站", "Back to chain.tw"],
    ["已收到前端示意。正式報名與訂閱表單將由主辦方後續串接。", "Placeholder received. The official registration and subscription form will be connected later by the organizer."],
  ]);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    node.originalText = node.nodeValue;
  });

  function translateTextNode(node, lang) {
    if (lang === "zh") {
      node.nodeValue = node.originalText;
      return;
    }
    const original = node.originalText;
    const trimmed = original.trim();
    const translated = textMap.get(trimmed);
    if (!translated) return;
    node.nodeValue = original.replace(trimmed, translated);
  }

  function setLanguage(lang) {
    document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
    document.body.classList.toggle("is-en", lang === "en");
    textNodes.forEach((node) => translateTextNode(node, lang));
    translatableItems.forEach((item) => {
      item.textContent = item.dataset[lang] || item.textContent;
    });
    langButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.langButton === lang));
  }

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 18);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      header.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      header && header.classList.remove("is-open");
      navToggle && navToggle.setAttribute("aria-expanded", "false");
    });
  });

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.langButton;
      setLanguage(lang);
    });
  });

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const note = form.querySelector("[data-form-note]");
      if (note) {
        note.textContent = document.documentElement.lang === "en"
          ? "Placeholder received. The official registration and subscription form will be connected later by the organizer."
          : "已收到前端示意。正式報名與訂閱表單將由主辦方後續串接。";
      }
    });
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  setLanguage("en");
})();
