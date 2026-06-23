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

  function setLanguage(locale, persist = false) {
    currentLocale = locale === "en" ? "en" : "zh-Hant";
    document.documentElement.lang = currentLocale;
    document.title = t("meta.title");
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (description) description.setAttribute("content", t("meta.description"));
    if (ogTitle) ogTitle.setAttribute("content", t("meta.title"));
    if (ogDescription) ogDescription.setAttribute("content", t("meta.description"));

    i18nItems.forEach((item) => {
      const value = t(item.dataset.i18n);
      if (item.dataset.i18nAttr) {
        item.setAttribute(item.dataset.i18nAttr, value);
      } else {
        item.textContent = value;
      }
    });

    renderFaq(currentLocale);
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

  function wireLinks() {
    registerLinks.forEach((link) => {
      if (config.registrationUrl) {
        link.href = config.registrationUrl;
        link.removeAttribute("aria-disabled");
      } else {
        link.href = "#contact";
        link.setAttribute("aria-disabled", "true");
      }
    });
    newsletterLinks.forEach((link) => {
      link.href = config.newsletterUrl || socials.newsletter || "https://chaintw.substack.com/";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    contactLinks.forEach((link) => {
      link.href = `mailto:${config.contactEmail || "taka@chain.tw"}`;
    });
  }

  wireLinks();
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
