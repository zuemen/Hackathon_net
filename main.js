(function () {
  const config = window.SITE_CONFIG || {};
  const translations = window.TRANSLATIONS || {};
  const faqGroups = window.FAQ_GROUPS || {};
  const socials = window.SOCIAL_LINKS || {};
  const defaultLocale = config.defaultLocale || "zh-Hant";
  const storedLocale = localStorage.getItem("site-locale");
  let currentLocale = storedLocale || defaultLocale;

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

  function t(key, locale = currentLocale) {
    return translations[locale]?.[key] || translations[defaultLocale]?.[key] || key;
  }

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 18);
  }

  function getNow() {
    const params = new URLSearchParams(window.location.search);
    const testNow = params.get("now") || window.__TEST_NOW;
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
      const name = next.querySelector("span")?.textContent.trim() || "";
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
      link.textContent = getRegistrationLabel(currentLocale, state);
      link.dataset.registrationState = state;
      if (state === "open" && config.registrationUrl) {
        link.href = config.registrationUrl;
        link.target = "_blank";
        link.rel = "noopener";
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#rules";
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.setAttribute("aria-disabled", "true");
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
    const canonical = document.querySelector('link[rel="canonical"]');
    if (description) description.setAttribute("content", t("meta.description"));
    if (ogTitle) ogTitle.setAttribute("content", t("og.title"));
    if (ogDescription) ogDescription.setAttribute("content", t("meta.description"));
    if (twitterTitle) twitterTitle.setAttribute("content", t("og.title"));
    if (twitterDescription) twitterDescription.setAttribute("content", t("meta.description"));
    if (canonical && config.canonicalUrl) canonical.href = config.canonicalUrl;
  }

  function renderJsonLd() {
    const node = document.querySelector("#event-jsonld");
    if (!node) return;
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
      },
      offers: {
        "@type": "Offer",
        url: config.registrationUrl,
        availabilityStarts: config.registrationOpenAt,
        validThrough: config.registrationCloseAt,
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      }
    };
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

  function updateInfoSessionLinks(now = getNow()) {
    const date = config.infoSessionDate || "2026-07-20";
    const endAt = new Date(config.infoSessionEndAt || `${date}T21:00:00+08:00`);
    const showBanner = now <= endAt;
    const applyUrl = config.registrationUrl || "#rules";
    const recordingUrl = config.infoSessionRecordingUrl;
    const showRecording = Boolean(recordingUrl);

    document.querySelectorAll("[data-info-session-banner]").forEach((el) => {
      el.hidden = !showBanner;
    });

    document.querySelectorAll("[data-info-session-actions]").forEach((el) => {
      el.hidden = false;
    });

    document.querySelectorAll("[data-info-session-link]").forEach((link) => {
      link.href = applyUrl;
      link.hidden = false;
    });

    document.querySelectorAll("[data-info-session-recording]").forEach((link) => {
      if (showRecording) {
        link.href = recordingUrl;
        link.hidden = false;
      } else {
        link.removeAttribute("href");
        link.hidden = true;
      }
    });
  }

  function setLanguage(locale, persist = false, initial = false) {
    currentLocale = locale === "en" ? "en" : "zh-Hant";
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

    // FAQ zh-Hant is pre-rendered statically in index.html for SEO; only
    // (re)render via JS when switching language or when the initial locale is en.
    if (!(initial && currentLocale === defaultLocale)) renderFaq(currentLocale);
    updateRegistrationLinks();
    updateTimelineStatus();
    updateRuleDownloads();
    updateInfoSessionLinks();
    if (renderCountdown) renderCountdown();

    langButtons.forEach((button) => {
      const active = button.dataset.langButton === currentLocale;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (persist) localStorage.setItem("site-locale", currentLocale);
  }

  function closeMenu() {
    document.body.classList.remove("nav-open");
    header?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }

  function scrollToInitialHash() {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const scrollToTarget = () => {
      const headerOffset = header?.offsetHeight || 88;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(targetTop, 0), behavior: "auto" });
      setHeaderState();
    };
    window.requestAnimationFrame(scrollToTarget);
    window.setTimeout(scrollToTarget, 250);
    window.setTimeout(scrollToTarget, 700);
    window.setTimeout(scrollToTarget, 1500);
    window.addEventListener("load", () => window.setTimeout(scrollToTarget, 100), { once: true });
  }

  wireLinks();
  renderJsonLd();
  applyFeatureFlags();
  setHeaderState();
  setLanguage(currentLocale, false, true);
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("nav-open");
      header?.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) navPanel.querySelector("a, button")?.focus();
    });
  }

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  langButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langButton, true));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

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
    const labelEl = el.querySelector("[data-countdown-label]");
    const daysEl = el.querySelector("[data-countdown-days]");
    const hoursEl = el.querySelector("[data-countdown-hours]");
    const minutesEl = el.querySelector("[data-countdown-minutes]");
    const secondsEl = el.querySelector("[data-countdown-seconds]");
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const openAt = new Date(config.registrationOpenAt);
    const closeAt = new Date(config.registrationCloseAt);
    const demoAt = new Date(config.demoDayAt || "2026-08-31T09:00:00+08:00");
    // Preserve any mock time (?now= / __TEST_NOW) while still ticking in real time.
    const offset = getNow().getTime() - Date.now();
    const pad = (n) => String(n).padStart(2, "0");

    function phase(now) {
      if (now < openAt) return { key: "countdown.beforeOpen", target: openAt };
      if (now <= closeAt) return { key: "countdown.beforeClose", target: closeAt };
      return { key: "countdown.demoDay", target: demoAt };
    }

    function tick() {
      const now = new Date(Date.now() + offset);
      const { key, target } = phase(now);
      let diff = Math.max(0, target.getTime() - now.getTime());
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      daysEl.textContent = pad(d);
      hoursEl.textContent = pad(h);
      minutesEl.textContent = pad(m);
      secondsEl.textContent = pad(s);
      if (labelEl) labelEl.textContent = t(key);
    }

    renderCountdown = tick;
    el.hidden = false;
    tick();
    window.setInterval(tick, 1000);
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

  initCountdown();
  initCounters();
  initTrackAccordion();
  initVenueMap();
  scrollToInitialHash();
})();
