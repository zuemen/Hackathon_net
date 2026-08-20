(function () {
  const config = window.SITE_CONFIG || {};
  const translations = window.TRANSLATIONS || {};
  const faqGroups = window.FAQ_GROUPS || {};
  const judges = Array.isArray(window.JUDGES) ? window.JUDGES : [];
  const socials = window.SOCIAL_LINKS || {};
  const defaultLocale = config.defaultLocale || "zh-Hant";
  let storedLocale = null;
  try {
    storedLocale = localStorage.getItem("site-locale");
  } catch {
    // Storage can be unavailable in strict privacy modes; the site still works.
  }
  const requestedLocale = new URLSearchParams(window.location.search).get("lang");
  const urlLocale = requestedLocale === "en"
    ? "en"
    : requestedLocale === "zh" || requestedLocale === "zh-Hant"
      ? "zh-Hant"
      : null;
  let currentLocale = urlLocale || (storedLocale === "en" ? "en" : defaultLocale);

  document.body.classList.add("js-on");

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector("[data-nav-panel]");
  const navLinks = document.querySelectorAll(".site-nav a");
  const langButtons = document.querySelectorAll("[data-lang-button]");
  const i18nItems = document.querySelectorAll("[data-i18n]");
  const faqRoot = document.querySelector("[data-faq-root]");
  const registerLinks = document.querySelectorAll("[data-registration-link]");
  const newsletterLinks = document.querySelectorAll("[data-newsletter-link]");
  const contactLinks = document.querySelectorAll("[data-contact-link]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderCountdown = null;
  let headerSolidState = null;
  let syncBackToTop = null;
  let challengeRevealTimer = null;

  function t(key, locale = currentLocale) {
    return translations[locale]?.[key] || translations[defaultLocale]?.[key] || key;
  }

  function syncLanguageUrl(locale) {
    const url = new URL(window.location.href);
    if (locale === "en") {
      url.searchParams.set("lang", "en");
    } else {
      url.searchParams.delete("lang");
    }
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function rafThrottle(callback) {
    let frameId = 0;
    let latestArgs = [];
    return (...args) => {
      latestArgs = args;
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        callback(...latestArgs);
      });
    };
  }

  function setHeaderState(scrollY = 0) {
    if (!header) return;
    const shouldBeSolid = scrollY > 18;
    if (headerSolidState === shouldBeSolid) return;
    headerSolidState = shouldBeSolid;
    header.classList.toggle("is-solid", shouldBeSolid);
  }

  function syncScrollUi() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    setHeaderState(scrollY);
    syncBackToTop?.(scrollY, viewportHeight);
  }

  function getNow() {
    const params = new URLSearchParams(window.location.search);
    const testNow = params.get("testNow") || params.get("now") || window.__TEST_NOW;
    return testNow ? new Date(testNow) : new Date();
  }

  function updateTimelineStatus(now = getNow()) {
    const ol = document.querySelector(".timeline");
    if (!ol) return;
    const steps = [...ol.querySelectorAll(".timeline-step")];
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let next = null;

    steps.forEach((step) => {
      const date = new Date(`${step.dataset.date}T00:00:00`);
      step.classList.toggle("is-past", date < today);
      if (!next && date >= today) next = step;
    });

    steps.forEach((step) => step.classList.remove("is-next"));
    if (next) next.classList.add("is-next");

    const status = document.getElementById("timelineStatus");
    if (!status) return;
    const en = currentLocale === "en";
    const weekday = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
    const todayText = en
      ? `Today ${now.getMonth() + 1}/${now.getDate()}`
      : `今天 ${now.getMonth() + 1}/${now.getDate()}（${weekday}）`;

    if (next) {
      const name = next.querySelector(":scope > span:last-child")?.textContent.trim() || "";
      const date = next.querySelector("time")?.textContent.trim() || "";
      status.textContent = en
        ? `${todayText} · Next: ${name} (${date})`
        : `${todayText}・下一個：${name}（${date}）`;
    } else {
      status.textContent = en ? `${todayText} · Event concluded` : `${todayText}・活動已結束`;
    }
  }

  function getRegistrationState(now = getNow()) {
    const override = config.registrationOverride || config.registrationStatusOverride;
    if (override === "open" || override === "closed" || override === "scheduled") return override;

    const status = config.registrationStatus;
    const openAt = new Date(config.registrationOpenAt);
    const closeAt = new Date(config.registrationCloseAt);
    if (status === "closed" || status === "disabled") return "closed";
    if (status === "open") return now <= closeAt ? "open" : "closed";
    if (now < openAt) return "scheduled";
    if (now <= closeAt) return "open";
    return "closed";
  }

  function getRegistrationLabel(locale = currentLocale, state = getRegistrationState()) {
    const labels = {
      "zh-Hant": {
        scheduled: "報名即將開放",
        open: "立即報名",
        closed: "報名已截止"
      },
      en: {
        scheduled: "Applications Opening Soon",
        open: "Apply Now",
        closed: "Registration Closed"
      }
    };
    return labels[locale]?.[state] || labels[defaultLocale][state];
  }

  function updateRegistrationLinks() {
    const state = getRegistrationState();
    registerLinks.forEach((link) => {
      link.hidden = false;
      link.classList.remove("is-phase-note");
      delete link.dataset.registrationPhase;
      link.textContent = getRegistrationLabel(currentLocale, state);
      link.dataset.registrationState = state;
      if (state === "open" && config.registrationUrl) {
        link.href = config.registrationUrl;
        link.target = "_blank";
        link.rel = "noopener";
        link.removeAttribute("aria-disabled");
        link.removeAttribute("tabindex");
      } else {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("tabindex", "-1");
        link.classList.add("is-phase-note");
        if (link.hasAttribute("data-mobile-cta")) link.hidden = true;
      }
    });
  }

  function formatRegistrationDeadline(date, locale = currentLocale) {
    const options = {
      timeZone: "Asia/Taipei",
      month: locale === "en" ? "short" : "numeric",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    };
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-TW", options)
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value])
    );
    if (locale === "en") {
      return `${parts.month} ${parts.day} (${parts.weekday}) · ${parts.hour}:${parts.minute}`;
    }
    return `${parts.month}/${parts.day}（${parts.weekday.replace(/^週/, "")}）${parts.hour}:${parts.minute}`;
  }

  function updateRegistrationDeadline(now = getNow()) {
    const closeAt = new Date(config.registrationCloseAt);
    const isValid = !Number.isNaN(closeAt.getTime());
    const state = isValid ? getRegistrationState(now) : "closed";
    const labelKey = state === "closed"
      ? "registration.deadline.closed"
      : "registration.deadline.open";

    document.querySelectorAll("[data-registration-deadline-wrap]").forEach((wrap) => {
      wrap.hidden = !isValid;
      wrap.dataset.state = state;
    });
    document.querySelectorAll("[data-registration-deadline-label]").forEach((label) => {
      label.textContent = t(labelKey);
    });
    document.querySelectorAll("[data-registration-deadline]").forEach((time) => {
      if (!isValid) return;
      time.dateTime = config.registrationCloseAt;
      time.textContent = formatRegistrationDeadline(closeAt);
    });
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderFinalists() {
    const section = document.getElementById("finalists");
    const grid = document.querySelector("[data-finalist-grid]");
    if (!section || !grid) return;

    const finalists = Array.isArray(config.finalists) ? config.finalists : [];
    if (!finalists.length) {
      section.hidden = true;
      grid.innerHTML = "";
      return;
    }

    section.hidden = false;
    grid.innerHTML = finalists
      .map((team) => {
        const track = team.track || "";
        const trackLabel = t(`finalists.track.${track}`);
        return `
          <div class="finalist-card">
            <span class="finalist-track" data-track="${escapeHTML(track)}">${escapeHTML(trackLabel)}</span>
            <strong>${escapeHTML(team.name)}</strong>
          </div>
        `;
      })
      .join("");
  }

  function localizedValue(value) {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    return value[currentLocale] || value[defaultLocale] || value.en || "";
  }

  function renderJudges() {
    const list = document.querySelector("[data-judges-list]");
    const status = document.querySelector("[data-judges-status]");
    if (!list) return;

    const confirmed = judges
      .map((person) => ({
        name: localizedValue(person.name),
        role: localizedValue(person.role),
        organization: localizedValue(person.organization),
        image: person.image || "",
        alt: localizedValue(person.alt)
      }))
      .filter((person) => person.name);

    list.hidden = !confirmed.length;
    if (status) status.hidden = Boolean(confirmed.length);
    list.innerHTML = confirmed
      .map((person) => {
        const details = [person.role, person.organization].filter(Boolean).join(" · ");
        const image = person.image
          ? `<img src="${escapeHTML(person.image)}" alt="${escapeHTML(person.alt || person.name)}" width="52" height="52" loading="lazy" decoding="async">`
          : "";
        return `
          <article class="judge-card">
            ${image}
            <div>
              <strong>${escapeHTML(person.name)}</strong>
              ${details ? `<span>${escapeHTML(details)}</span>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renumberSectionKickers() {
    let index = 1;
    document.querySelectorAll("main > section[id]:not([hidden]) .section-kicker").forEach((kicker) => {
      kicker.textContent = kicker.textContent.replace(/^\d+\s*\//, `${String(index).padStart(2, "0")} /`);
      index += 1;
    });
  }

  function applyPhase() {
    const phase = config.phase || "registration";
    if (phase === "registration") return;

    const phaseMap = {
      screening: { key: "phase.screening", href: null, disabled: true, hideMobile: true },
      "demo-day": { key: "phase.demoday", href: "#venue", disabled: false, hideMobile: false },
      post: { key: "phase.post", href: null, disabled: true, hideMobile: true }
    };
    const phaseConfig = phaseMap[phase];
    if (!phaseConfig) return;

    registerLinks.forEach((link) => {
      link.textContent = t(phaseConfig.key);
      link.dataset.registrationPhase = phase;
      link.hidden = phaseConfig.hideMobile && link.hasAttribute("data-mobile-cta");
      link.classList.toggle("is-phase-note", phaseConfig.disabled);
      if (phaseConfig.href) {
        link.href = phaseConfig.href;
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.removeAttribute("aria-disabled");
        link.removeAttribute("tabindex");
      } else {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("tabindex", "-1");
      }
    });
  }

  function renderFaq(locale) {
    if (!faqRoot || !faqGroups[locale]) return;
    faqRoot.innerHTML = faqGroups[locale]
      .map(
        ([groupTitle, items]) => `
          <section class="faq-group">
            <h3>${groupTitle}</h3>
            ${items
              .map(
                ([question, answer]) => `
                  <details>
                    <summary>${question}</summary>
                    <p>${answer}</p>
                  </details>
                `
              )
              .join("")}
          </section>
        `
      )
      .join("");
  }

  function updateMetadata() {
    document.title = t("meta.title");
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = new URL(config.canonicalUrl || window.location.origin);
    if (currentLocale === "en") canonicalUrl.searchParams.set("lang", "en");
    if (description) description.setAttribute("content", t("meta.description"));
    if (ogTitle) ogTitle.setAttribute("content", t("og.title"));
    if (ogDescription) ogDescription.setAttribute("content", t("meta.description"));
    if (twitterTitle) twitterTitle.setAttribute("content", t("og.title"));
    if (twitterDescription) twitterDescription.setAttribute("content", t("meta.description"));
    if (ogLocale) ogLocale.setAttribute("content", currentLocale === "en" ? "en_US" : "zh_TW");
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl.href);
    if (canonical) canonical.href = canonicalUrl.href;
  }

  function renderJsonLd() {
    const node = document.querySelector("#event-jsonld");
    if (!node) return;
    const registrationState = getRegistrationState();
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: config.eventName || "Trustworthy AI Hackathon｜可信 AI 黑客松",
      startDate: config.eventStart,
      endDate: config.eventEnd,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: config.venue || "N24 台北方舟",
        address: "Taipei, Taiwan"
      },
      organizer: {
        "@type": "Organization",
        name: config.organizerName || "Taiwan Association for Blockchain Ecosystem Innovation (TABEI)",
        url: config.organizerUrl || "https://www.chain.tw/"
      }
    };
    if (registrationState === "open" && config.registrationUrl) {
      jsonLd.offers = {
        "@type": "Offer",
        url: config.registrationUrl,
        validFrom: config.registrationOpenAt,
        validThrough: config.registrationCloseAt,
        price: 0,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      };
    }
    node.textContent = JSON.stringify(jsonLd, null, 2);
  }

  function applyFeatureFlags() {
    document.querySelectorAll("[data-feature-flag]").forEach((section) => {
      const flag = section.dataset.featureFlag;
      section.hidden = !Boolean(config[flag]);
    });
  }

  function wireLinks() {
    newsletterLinks.forEach((link) => {
      link.href = config.newsletterUrl || socials.newsletter || "https://chaintw.substack.com/";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    contactLinks.forEach((link) => {
      const email = config.contactEmail || "hackathon2026@chain.tw";
      link.href = `mailto:${email}`;
      link.textContent = email;
    });
    updateMatchmakingLinks();
  }

  function updateMatchmakingLinks() {
    const url = config.matchmakingUrl;
    document.querySelectorAll("[data-matchmaking-link]").forEach((link) => {
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-disabled");
      } else {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.setAttribute("aria-disabled", "true");
      }
    });
  }

  function updateRuleDownloads() {
    const rulesEN = currentLocale === "en";
    const rulesHref = rulesEN
      ? "assets/official/Trustworthy-AI-Hackathon-2026-Rules-EN.pdf"
      : "assets/official/Trustworthy-AI-Hackathon-2026-Rules.pdf";
    const rulesName = rulesEN
      ? "Trustworthy-AI-Hackathon-2026-Rules-EN.pdf"
      : "可信AI黑客松2026_比賽辦法.pdf";

    document.querySelectorAll("[data-download-rules]").forEach((link) => {
      link.setAttribute("href", rulesHref);
      link.setAttribute("download", rulesName);
    });
  }

  function challengeRevealAt(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || "")) return null;
    const revealAt = new Date(`${dateString}T00:00:00+08:00`);
    return Number.isNaN(revealAt.getTime()) ? null : revealAt;
  }

  function formatChallengeRevealDate(dateString, locale = currentLocale) {
    const revealAt = challengeRevealAt(dateString);
    if (!revealAt) return dateString || "";
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-TW", {
      timeZone: "Asia/Taipei",
      month: locale === "en" ? "short" : "numeric",
      day: "numeric"
    }).format(revealAt);
  }

  function hasMockNow() {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get("testNow") || params.get("now") || window.__TEST_NOW);
  }

  function updateChallengeReveal(now = getNow()) {
    const cards = [...document.querySelectorAll("[data-challenge-id]")];
    if (config.challengeRevealScheduleEnabled === false) {
      cards.forEach((card) => {
        const id = card.dataset.challengeId;
        const title = card.querySelector("[data-challenge-title]");
        const question = card.querySelector("[data-challenge-question]");
        const titleKey = `challenge.${id}.title`;
        const questionKey = `challenge.${id}.question`;
        card.classList.remove("is-locked");
        card.dataset.revealState = "revealed";
        delete card.dataset.revealDate;
        if (title) {
          title.dataset.i18n = titleKey;
          title.textContent = t(titleKey);
        }
        if (question) {
          question.dataset.i18n = questionKey;
          question.textContent = t(questionKey);
        }
      });
      document.querySelectorAll("[data-tracks-body]").forEach((body) => {
        body.dataset.i18n = "tracks.body.complete";
        body.textContent = t("tracks.body.complete");
      });
      if (challengeRevealTimer) {
        window.clearTimeout(challengeRevealTimer);
        challengeRevealTimer = null;
      }
      return;
    }
    const revealDates = config.challengeRevealDates || {};
    const nowTime = now instanceof Date ? now.getTime() : NaN;
    const revealTimes = [];
    let scheduledCards = 0;
    let revealedCards = 0;

    cards.forEach((card) => {
      const id = card.dataset.challengeId;
      const dateString = revealDates[id];
      const revealAt = challengeRevealAt(dateString);
      const title = card.querySelector("[data-challenge-title]");
      const question = card.querySelector("[data-challenge-question]");
      const locked = Boolean(revealAt && !Number.isNaN(nowTime) && nowTime < revealAt.getTime());

      if (revealAt) {
        scheduledCards += 1;
        revealTimes.push(revealAt);
        if (!locked) revealedCards += 1;
      }

      card.classList.toggle("is-locked", locked);
      card.dataset.revealState = locked ? "locked" : "revealed";
      if (dateString) card.dataset.revealDate = dateString;

      const titleKey = locked ? "challenge.locked.title" : `challenge.${id}.title`;
      if (title) {
        title.dataset.i18n = titleKey;
        title.textContent = t(titleKey);
      }

      const questionKey = locked ? "challenge.locked.date" : `challenge.${id}.question`;
      if (question) {
        question.dataset.i18n = questionKey;
        question.textContent = locked
          ? t(questionKey).replace("{date}", formatChallengeRevealDate(dateString))
          : t(questionKey);
      }
    });

    const allRevealed = cards.length > 0
      && scheduledCards === cards.length
      && revealedCards === scheduledCards;
    const tracksBodyKey = allRevealed ? "tracks.body.complete" : "tracks.body";
    document.querySelectorAll("[data-tracks-body]").forEach((body) => {
      body.dataset.i18n = tracksBodyKey;
      body.textContent = t(tracksBodyKey);
    });

    if (challengeRevealTimer) {
      window.clearTimeout(challengeRevealTimer);
      challengeRevealTimer = null;
    }
    if (!hasMockNow() && !Number.isNaN(nowTime)) {
      const nextReveal = revealTimes
        .filter((date) => date.getTime() > nowTime)
        .sort((a, b) => a - b)[0];
      if (nextReveal) {
        const delay = Math.min(nextReveal.getTime() - nowTime + 100, 2147483647);
        challengeRevealTimer = window.setTimeout(() => updateChallengeReveal(getNow()), delay);
      }
    }
  }

  function updateInfoSessionLinks(now = getNow()) {
    const date = config.infoSessionDate || "2026-07-20";
    const endAt = new Date(config.infoSessionEndAt || `${date}T21:00:00+08:00`);
    const isArchived = now > endAt;
    const showBanner = !isArchived;
    const applyUrl = config.infoSessionApplyUrl || config.registrationUrl || "#rules";
    const showRegistration = showBanner && Boolean(applyUrl);
    const bodyKey = isArchived ? "preevent.info.body.past" : "preevent.info.body";

    document.querySelectorAll("[data-info-session-card]").forEach((card) => {
      card.dataset.state = isArchived ? "archive" : "upcoming";
    });

    document.querySelectorAll("[data-info-session-body]").forEach((body) => {
      body.dataset.i18n = bodyKey;
      body.textContent = t(bodyKey);
    });

    document.querySelectorAll("[data-info-session-badge]").forEach((badge) => {
      badge.hidden = !isArchived;
      badge.textContent = t("preevent.info.badge.past");
    });

    document.querySelectorAll("[data-info-session-banner]").forEach((el) => {
      el.hidden = !showBanner;
    });

    document.querySelectorAll("[data-info-session-actions]").forEach((el) => {
      el.hidden = !showRegistration;
    });

    document.querySelectorAll("[data-info-session-link]").forEach((link) => {
      link.href = applyUrl;
      link.hidden = !showRegistration;
    });
  }

  function setLanguage(locale, persist = false, initial = false, updateUrl = true) {
    currentLocale = locale === "en" ? "en" : "zh-Hant";
    if (updateUrl) syncLanguageUrl(currentLocale);
    document.documentElement.lang = currentLocale;
    document.body.classList.toggle("is-en", currentLocale === "en");
    updateMetadata();

    i18nItems.forEach((item) => {
      const value = t(item.dataset.i18n);
      if (item.dataset.i18nAttr) {
        item.setAttribute(item.dataset.i18nAttr, value);
      } else {
        item.textContent = value;
      }
    });
    updateChallengeReveal();

    // FAQ zh-Hant is pre-rendered statically in index.html for SEO; only
    // (re)render via JS when switching language or when the initial locale is en.
    if (!(initial && currentLocale === defaultLocale)) renderFaq(currentLocale);
    renderFinalists();
    renderJudges();
    renumberSectionKickers();
    updateRegistrationLinks();
    updateRegistrationDeadline();
    applyPhase();
    updateTimelineStatus();
    updateRuleDownloads();
    updateInfoSessionLinks();
    updateMatchmakingLinks();
    if (renderCountdown) renderCountdown();

    langButtons.forEach((button) => {
      const active = button.dataset.langButton === currentLocale;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (persist) {
      try {
        localStorage.setItem("site-locale", currentLocale);
      } catch {
        // Language switching should not depend on storage availability.
      }
    }
  }

  let menuReturnFocus = null;

  function updateNavToggleState(isOpen) {
    if (!navToggle) return;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    const label = navToggle.querySelector(".sr-only");
    if (!label) return;
    label.dataset.i18n = isOpen ? "nav.close" : "nav.menu";
    label.textContent = t(label.dataset.i18n);
  }

  function getMenuFocusableItems() {
    if (!navPanel) return [];
    return [...navPanel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((item) => !item.hidden && item.getClientRects().length > 0);
  }

  function closeMenu(restoreFocus = false) {
    const wasOpen = document.body.classList.contains("nav-open");
    document.body.classList.remove("nav-open");
    header?.classList.remove("is-open");
    updateNavToggleState(false);
    if (restoreFocus && wasOpen) {
      (menuReturnFocus || navToggle)?.focus();
    }
    menuReturnFocus = null;
  }

  function scrollToInitialHash() {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const scrollToTarget = () => {
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start", behavior: "auto" });
      window.requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehavior;
      });
    };
    if (document.readyState === "complete") {
      scrollToTarget();
    } else {
      window.addEventListener("load", scrollToTarget, { once: true });
    }
  }

  wireLinks();
  renderJsonLd();
  applyFeatureFlags();
  setLanguage(currentLocale, false, true);
  const handleScrollUi = rafThrottle(syncScrollUi);
  window.addEventListener("scroll", handleScrollUi, { passive: true });
  window.addEventListener("resize", handleScrollUi);

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", () => {
      const isOpen = !document.body.classList.contains("nav-open");
      if (!isOpen) {
        closeMenu(true);
        return;
      }
      menuReturnFocus = document.activeElement;
      document.body.classList.add("nav-open");
      header?.classList.toggle("is-open", isOpen);
      updateNavToggleState(true);
      window.requestAnimationFrame(() => getMenuFocusableItems()[0]?.focus());
    });
  }

  navLinks.forEach((link) => link.addEventListener("click", () => closeMenu(false)));
  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.langButton, true);
      if (window.innerWidth <= 820 && document.body.classList.contains("nav-open")) {
        closeMenu(true);
      }
    });
  });

  window.addEventListener("popstate", () => {
    const lang = new URLSearchParams(window.location.search).get("lang");
    setLanguage(lang === "en" ? "en" : defaultLocale, false, false, false);
  });

  document.addEventListener("keydown", (event) => {
    const menuIsOpen = document.body.classList.contains("nav-open");
    if (event.key === "Escape" && menuIsOpen) {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== "Tab" || !menuIsOpen || window.innerWidth > 820) return;
    const focusableItems = getMenuFocusableItems();
    if (!focusableItems.length) return;
    const first = focusableItems[0];
    const last = focusableItems[focusableItems.length - 1];
    if (event.shiftKey && (document.activeElement === first || !navPanel.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (header?.contains(event.target)) return;
    closeMenu(false);
  });

  window.addEventListener("resize", rafThrottle(() => {
    if (window.innerWidth > 820) closeMenu(false);
  }));

  const revealItems = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  function initCountdown() {
    const el = document.querySelector("[data-countdown]");
    if (!config.showCountdown) {
      if (el) el.hidden = true;
      return;
    }
    if (!el) return;
    const activeEl = el.querySelector("[data-countdown-active]");
    const closedEl = el.querySelector("[data-countdown-closed]");
    const labelEl = el.querySelector("[data-countdown-label]");
    const daysEl = el.querySelector("[data-countdown-days]");
    const hoursEl = el.querySelector("[data-countdown-hours]");
    const minutesEl = el.querySelector("[data-countdown-minutes]");
    const secondsEl = el.querySelector("[data-countdown-seconds]");
    if (!activeEl || !closedEl || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const closeAt = new Date(config.registrationCloseAt);
    // Preserve any mock time (?now= / __TEST_NOW) while still ticking in real time.
    const offset = getNow().getTime() - Date.now();
    const pad = (n) => String(n).padStart(2, "0");

    function tick() {
      const now = new Date(Date.now() + offset);
      if (Number.isNaN(closeAt.getTime()) || now >= closeAt) {
        activeEl.hidden = true;
        closedEl.hidden = false;
        el.dataset.countdownState = "closed";
        return true;
      }

      activeEl.hidden = false;
      closedEl.hidden = true;
      el.dataset.countdownState = "active";
      let remainingSeconds = Math.ceil((closeAt.getTime() - now.getTime()) / 1000);
      const d = Math.floor(remainingSeconds / 86400); remainingSeconds -= d * 86400;
      const h = Math.floor(remainingSeconds / 3600); remainingSeconds -= h * 3600;
      const m = Math.floor(remainingSeconds / 60); remainingSeconds -= m * 60;
      const s = remainingSeconds;
      daysEl.textContent = pad(d);
      hoursEl.textContent = pad(h);
      minutesEl.textContent = pad(m);
      secondsEl.textContent = pad(s);
      if (labelEl) labelEl.textContent = t("countdown.beforeClose");
      return false;
    }

    renderCountdown = tick;
    el.hidden = false;
    if (!tick()) {
      const intervalId = window.setInterval(() => {
        if (tick()) window.clearInterval(intervalId);
      }, 1000);
    }
  }

  function initCounters() {
    const nums = document.querySelectorAll("[data-count-to]");
    if (!nums.length) return;
    const formatNum = (el, value) => {
      const prefix = el.dataset.countPrefix || "";
      const suffix = el.dataset.countSuffix || "";
      el.textContent = prefix + Math.round(value).toLocaleString("en-US") + suffix;
    };
    // Reduced motion / no observer: keep the final values already in the markup.
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    const animate = (el) => {
      const target = Number(el.dataset.countTo) || 0;
      const duration = 1200;
      const start = performance.now();
      const step = (ts) => {
        const p = Math.min(1, Math.max(0, (ts - start) / duration));
        const eased = 1 - Math.pow(1 - p, 3);
        formatNum(el, target * eased);
        if (p < 1) requestAnimationFrame(step);
        else formatNum(el, target);
      };
      formatNum(el, 0);
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach((el) => observer.observe(el));
  }

  function initVenueMap() {
    const link = document.querySelector("[data-venue-map]");
    if (!link) return;
    const url = config.venueMapUrl;
    if (url) {
      link.href = url;
      link.hidden = false;
    } else {
      link.removeAttribute("href");
      link.hidden = true;
    }
  }

  function initTrackAccordion() {
    document.querySelectorAll(".track-accordion details").forEach((details) => {
      const summary = details.querySelector("summary");
      if (!summary) return;
      const sync = () => summary.setAttribute("aria-expanded", String(details.open));
      sync();
      details.addEventListener("toggle", sync);
    });
  }

  function initScrollSpy() {
    if (!navLinks.length || !("IntersectionObserver" in window)) return;
    const linkById = new Map();
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#") && href.length > 1) linkById.set(href.slice(1), link);
    });
    const sections = [...document.querySelectorAll("section[id]")].filter((section) => linkById.has(section.id));
    if (!sections.length) return;

    const setActive = (id) => {
      navLinks.forEach((link) => {
        const isActive = link === linkById.get(id);
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (current) setActive(current.target.id);
      },
      { rootMargin: "-22% 0px -68% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  function initBackToTop() {
    const button = document.querySelector("[data-back-top]");
    if (!button) return;
    syncBackToTop = (scrollY, viewportHeight) => {
      const show = scrollY > viewportHeight * 2;
      button.hidden = !show;
      button.classList.toggle("is-visible", show);
      button.setAttribute("aria-hidden", String(!show));
      button.tabIndex = show ? 0 : -1;
    };
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
    button.hidden = true;
    button.setAttribute("aria-hidden", "true");
    button.tabIndex = -1;
  }

  function initMobileCta() {
    const cta = document.querySelector("[data-mobile-cta]");
    const hero = document.getElementById("hero");
    if (!cta || !hero) return;
    const interactive = cta.matches("a[href], button");
    let requestedVisible = false;

    const setVisible = (visible) => {
      requestedVisible = visible;
      const show = requestedVisible && window.innerWidth <= 700 && !cta.hidden;
      cta.classList.toggle("is-visible", show);
      cta.setAttribute("aria-hidden", String(!show));
      if (interactive) cta.tabIndex = show ? 0 : -1;
      else cta.removeAttribute("tabindex");
    };

    setVisible(false);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0.08 }
      );
      observer.observe(hero);
    } else {
      const sync = () => setVisible(window.scrollY > hero.offsetHeight * 0.75);
      sync();
      window.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync);
    }
    window.addEventListener("resize", rafThrottle(() => setVisible(requestedVisible)));
  }

  initCountdown();
  initCounters();
  initTrackAccordion();
  initVenueMap();
  initScrollSpy();
  initBackToTop();
  initMobileCta();
  scrollToInitialHash();
})();
