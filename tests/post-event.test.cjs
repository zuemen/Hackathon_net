const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');

function setup() {
  const window = { location: { search: '' }, matchMedia: () => ({ matches: true }) };
  const context = vm.createContext({ window, URLSearchParams, localStorage: { getItem: () => null }, document: {
    documentElement: { dataset: {} }, body: { classList: { add() {} } },
    querySelector: () => null, querySelectorAll: () => []
  } });
  vm.runInContext(read('site-config.js'), context);
  vm.runInContext(read('content.js'), context);
  // Expose the actual functions in an isolated VM before browser initialization.
  vm.runInContext(read('main.js').replace('  wireLinks();', '  window.testApi = { renderResults, initCountdown }; return;'), context);
  return window;
}

test('official groups, money, names, translations and post-event settings', () => {
  const w = setup();
  const c = w.SITE_CONFIG;
  assert.equal(c.phase, 'post');
  assert.equal(c.showCountdown, false);
  assert.equal(c.prizePoolMayIncrease, false);
  assert.equal(c.selectedTeams, 20);
  assert.equal(c.demoDayTeams, 19);
  assert.deepEqual(Array.from(c.results, g => g.winners.length), [1, 2, 3, 2, 1]);
  const names = ['Human ID', 'BuLuanPay', '碳數據搞剛三劍客', 'AI-LocalKing', 'Stable Book', 'NewJeans always five', '區塊不只一塊', '守天使', '翁仲和'];
  for (const locale of ['zh-Hant', 'en']) {
    const dict = w.TRANSLATIONS[locale];
    assert.deepEqual(Array.from(c.results.flatMap(g => g.winners.map(w => dict[w.nameKey]))), names);
    for (const group of c.results) {
      for (const entry of [group, ...group.winners]) {
        for (const [key, value] of Object.entries(entry)) {
          if (key.endsWith('Key')) assert.ok(dict[value], `${locale}: ${value}`);
        }
      }
    }
    assert.equal(dict['prize.runner.amount'], 'USD 2,000');
    assert.equal(dict['prize.special.amount'], 'USD 1,000');
    const output = {};
    w.testApi.renderResults(c.results, locale, output);
    assert.equal((output.innerHTML.match(/<article /g) || []).length, 9);
    assert.equal((output.innerHTML.match(/class="prize-amount"/g) || []).length, 8);
    assert.ok(!/<img|<picture/.test(output.innerHTML));
    assert.ok(output.innerHTML.includes(dict['results.winner.humanId.description']));
  }
  assert.equal(c.results[4].amountKey, undefined);
});

test('renderer escapes free text, handles absent DOM and does not depend on flags', () => {
  const w = setup();
  const hostile = '<img src=x onerror="alert(1)"> & \'text\'';
  for (const key of ['award', 'amount', 'count', 'name', 'role', 'description']) w.TRANSLATIONS.en[key] = hostile;
  const output = {};
  w.testApi.renderResults([{ awardKey: 'award', amountKey: 'amount', countKey: 'count', featured: true,
    winners: [{ nameKey: 'name', roleKey: 'role', descriptionKey: 'description' }] }], 'en', output);
  assert.ok(!output.innerHTML.includes('<img'));
  assert.ok(output.innerHTML.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;text&#39;'));
  assert.doesNotThrow(() => w.testApi.renderResults([], 'en'));
  assert.doesNotThrow(() => w.testApi.initCountdown());
  w.SITE_CONFIG.showCountdown = true;
  w.SITE_CONFIG.phase = 'registration';
  assert.doesNotThrow(() => w.testApi.initCountdown());
});

test('all HTML i18n references resolve and obsolete prize copy is absent', () => {
  const w = setup();
  for (const file of ['index.html', 'faq.html', 'guide.html', 'challenges.html', 'workshops/0815.html', 'workshops/0822.html']) {
    for (const [, key] of read(file).matchAll(/data-i18n="([^"]+)"/g)) {
      for (const locale of ['zh-Hant', 'en']) assert.ok(w.TRANSLATIONS[locale][key], `${file}: ${locale}: ${key}`);
    }
  }
  for (const file of ['index.html', 'faq.html', 'content.js']) {
    assert.ok(!/將隨贊助加碼|may increase with sponsorship|grows with sponsors|特別獎隊數與分配方式以正式公告為準|The number of Special Award recipients and allocation method are subject to official announcement/i.test(read(file)), file);
  }
  assert.ok(!/data-countdown|registration\.closed\./.test(read('index.html')));
  assert.ok(!/>22<|60-100/.test(read('index.html')));
  const staticJsonLd = read('index.html').match(/id="event-jsonld">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(staticJsonLd).eventStatus, 'https://schema.org/EventCompleted');
});

test('judges and mentors retain their data, HTML and rendering', () => {
  const baseline = file => execFileSync('git', ['show', `HEAD:${file}`], { cwd: root, encoding: 'utf8' });
  const old = { window: {} };
  vm.runInNewContext(baseline('content.js'), old);
  const w = setup();
  for (const key of ['JUDGES', 'MENTORS']) assert.equal(JSON.stringify(w[key]), JSON.stringify(old.window[key]));
  const peopleSection = text => text.slice(text.indexOf('<section class="section" id="judges">'), text.indexOf('<section class="statband-section"'));
  assert.equal(peopleSection(read('index.html')), peopleSection(baseline('index.html')));
  const renderer = text => text.slice(text.indexOf('  function renderPeople('), text.indexOf('  function renumberSectionKickers('));
  assert.equal(renderer(read('main.js')), renderer(baseline('main.js')));
});
