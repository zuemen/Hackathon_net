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

  function getRegistrationState(now = getNow()) {
    const override = config.registrationOverride || config.registrationStatusOverride;
    if (override === "open" || override === "closed" || override === "scheduled") return override;
    const status = config.registrationStatus;
    if (status === "open" || status === "closed") return status;
    if (status === "disabled") return "closed";

    const openAt = new Date(config.registrationOpenAt);
    const closeAt = new Date(config.registrationCloseAt);
    if (now < openAt) return "scheduled";
    if (now <= closeAt) return "open";
    return "closed";
  }

  function getRegistrationLabel(locale = currentLocale, state = getRegistrationState()) {
    const labels = {
      "zh-Hant": {
        scheduled: "7/4 開放報名",
        open: "立即報名",
        closed: "報名已截止"
      },
      en: {
        scheduled: "Registration Opens Jul 4",
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
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#contact";
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
      link.href = `mailto:${config.contactEmail || "taka@chain.tw"}`;
    });
  }

  function setLanguage(locale, persist = false) {
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

    renderFaq(currentLocale);
    updateRegistrationLinks();
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

  wireLinks();
  renderJsonLd();
  applyFeatureFlags();
  setHeaderState();
  setLanguage(currentLocale, false);
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
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();
