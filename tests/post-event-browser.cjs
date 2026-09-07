const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8080';
const artifacts = path.resolve(__dirname, '../artifacts');

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 1024, 820, 768, 390, 375, 320]) {
      console.log(`Checking ${width}px`);
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => {
        window.__intervals = 0;
        const original = window.setInterval;
        window.setInterval = (...args) => { window.__intervals++; return original(...args); };
      });
      await page.goto(`${base}/?lang=zh-Hant`, { waitUntil: 'load' });
      const peopleBefore = await page.locator('#judges').innerHTML();
      for (const locale of ['zh-Hant', 'en', 'zh-Hant']) {
        if (width <= 820) await page.locator('.nav-toggle').click();
        await page.locator(`[data-lang-button="${locale}"]`).click();
        const state = await page.evaluate(() => {
          const d = document;
          const groups = [...d.querySelectorAll('#results .results-group')];
          return {
            locale: d.documentElement.lang,
            overflow: d.documentElement.scrollWidth > innerWidth + 1,
            intervals: window.__intervals,
            sizes: groups.map(g => g.querySelectorAll('.prize-card').length),
            names: [...d.querySelectorAll('#results h4')].map(n => n.textContent),
            contributionMoney: groups.at(-1).querySelectorAll('.prize-amount').length,
            stats: [...d.querySelectorAll('.statband-num')].map(n => n.textContent),
            statLabels: [...d.querySelectorAll('.statband-label')].map(n => n.textContent),
            nav: d.querySelector('.site-nav a[href="#results"]').textContent,
            hero: d.querySelector('#hero [data-i18n="event.post.title"]').textContent,
            descriptions: [...d.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]')].map(n => n.content),
            expectedDescription: window.TRANSLATIONS[d.documentElement.lang]['meta.description'],
            jsonLd: JSON.parse(d.querySelector('#event-jsonld').textContent).eventStatus,
            kicker: d.querySelector('#results .section-kicker').textContent,
            tracksKicker: d.querySelector('#tracks .section-kicker').textContent,
            finalistsKicker: d.querySelector('#finalists .section-kicker').textContent,
            resultsHidden: !!d.querySelector('#results').closest('[hidden]'),
            order: d.querySelector('#partners').nextElementSibling.id === 'results' && d.querySelector('#results').nextElementSibling.id === 'tracks',
            staleStatus: /初選名單將於|Shortlist results will|00 天|grows with sponsors|將隨贊助加碼/.test(d.body.innerText)
          };
        });
        assert.equal(state.locale, locale);
        assert.equal(state.overflow, false, `${width}/${locale} overflow`);
        assert.equal(state.intervals, 0);
        assert.deepEqual(state.sizes, [1, 2, 3, 2, 1]);
        assert.deepEqual(state.names, ['Human ID', 'BuLuanPay', '碳數據搞剛三劍客', 'AI-LocalKing', 'Stable Book', 'NewJeans always five', '區塊不只一塊', '守天使', '翁仲和']);
        assert.equal(state.contributionMoney, 0);
        assert.deepEqual(state.stats, ['USD 14,000+', '20', '19', '3']);
        assert.equal(state.nav, locale === 'en' ? 'Results' : '得獎名單');
        assert.equal(state.hero, locale === 'en' ? 'The event has concluded' : '活動已圓滿結束');
        assert.ok(state.descriptions.every(d => d === state.expectedDescription));
        assert.equal(state.jsonLd, 'https://schema.org/EventCompleted');
        assert.equal(state.kicker, '03 / Results');
        assert.equal(state.tracksKicker, '04 / Challenge Topics');
        assert.equal(state.finalistsKicker, '09 / Finalists');
        assert.equal(state.resultsHidden, false);
        assert.equal(state.order, true);
        assert.equal(state.staleStatus, false);
        if (width <= 820) await page.locator('.nav-toggle').click();
        await page.locator('.site-nav a[href="#results"]').click();
        await page.waitForFunction(() => document.querySelector('#results-title').getBoundingClientRect().top >= document.querySelector('[data-header]').getBoundingClientRect().bottom);
        assert.equal(await page.locator('body').evaluate(n => n.classList.contains('nav-open')), false);
        if ([1440, 390].includes(width)) {
          await page.locator('#results').screenshot({ path: path.join(artifacts, `post-event-results-${width}-${locale}.png`) });
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({ path: path.join(artifacts, `post-event-hero-${width}-${locale}.png`) });
        }
      }
      assert.equal(await page.locator('#judges').innerHTML(), peopleBefore, 'people section changed after locale round trip');
      // Feature switches and historic browser dates must never suppress published results.
      await page.evaluate(() => { window.SITE_CONFIG.showPrizeBreakdown = false; window.SITE_CONFIG.finalists = [{ name: 'Test finalist', track: 'supply' }]; });
      if (width <= 820) await page.locator('.nav-toggle').click();
      await page.locator('[data-lang-button="en"]').click();
      assert.equal(await page.locator('#results .prize-card').count(), 9);
      assert.equal(await page.locator('#finalists .section-kicker').textContent(), '09 / Finalists');
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: both languages, navigation, metadata, results, no overflow/timer/errors`);
      await page.close();
    }
    for (const javaScriptEnabled of [true, false]) {
      const page = await browser.newPage({ javaScriptEnabled, reducedMotion: 'reduce' });
      await page.goto(`${base}/`);
      assert.equal(await page.locator('#results .prize-card').count(), 9);
      await page.goto(`${base}/faq.html`);
      assert.equal(await page.locator('[data-faq-root] details').count(), 28);
      const prize = page.locator('details').filter({ has: page.locator('summary', { hasText: '獎項有哪些' }) });
      assert.match(await prize.textContent(), /特別獎 2 隊各 USD 1,000/);
      if (javaScriptEnabled) {
        await page.locator('[data-lang-button="en"]').click();
        assert.match(await page.locator('[data-faq-root]').textContent(), /Special Award, 2 teams at USD 1,000 each/);
      }
      await page.close();
    }
    console.log('PASS static SEO fallbacks and bilingual FAQ');
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
