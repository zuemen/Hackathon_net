# chain.tw Visual Audit

Reference checked: https://www.chain.tw/en

## Actual Observations

- Overall tone: association / community website, not SaaS product. White and near-white sections dominate the page.
- Header: computed reference header is a tall logo-led region, around 174px in the captured desktop viewport, with transparent / white treatment and no heavy shadow.
- Logo: the first reference logo image rendered around 317px x 64px on desktop. It is a wide official association logo, not a small icon mark.
- Typography: reference section heading observed around 44px, weight 400, line-height about 61.6px. It reads editorial and organization-led rather than SaaS display type.
- Color impression: formal dark teal-blue text, brand teal / cyan accents from TABEI identity, restrained neutral gray separators.
- Hero rhythm: content-led, official and editorial. It does not rely on cyber grid, glowing nodes, or dark AI matrix backgrounds.
- Section rhythm: generous vertical spacing, strong hierarchy, concise content groups. Cards are not the main visual language everywhere.
- Cards / modules: light borders, minimal shadow, small radius or squared edges. Brand color appears as lines, labels, and subtle accents.
- Footer: association footer uses official identity and social/newsletter links; visual weight stays formal and restrained.

## Implementation Decisions for Hackathon Page

- Replace AI/SaaS color system with TABEI-oriented tokens: deep teal-blue, teal, cyan, ice, paper, muted ink.
- Keep at least 70% of the page white / near-white.
- Remove network grid and glowing AI visual language from hero.
- Use Chinese-first hero hierarchy: 可信 AI 黑客松 as primary; English name as secondary.
- Increase official TABEI logo display size in the header and remove the small simulated text lockup.
- Reduce card radius to 2-6px and shadow to near-none. Use borders and teal accent lines.
- Convert stat grids and timeline from dashboard cards to editorial information blocks.
- Keep official TABEI and N24 assets local under assets/official.
- Keep gold only as a small prize accent, never as a global UI color.
- Footer uses dark teal-blue and official association links.

## Screenshot Outputs

- Desktop reference: `artifacts/reference-chain-desktop.png`
- Mobile reference: `artifacts/reference-chain-mobile.png`
- Before desktop: `artifacts/before-hackathon-desktop.png`
- Before mobile: `artifacts/before-hackathon-mobile.png`
- After desktop: `artifacts/after-hackathon-desktop.png`
- After mobile: `artifacts/after-hackathon-mobile.png`
- Desktop comparison: `artifacts/visual-comparison-desktop.png`
- Mobile comparison: `artifacts/visual-comparison-mobile.png`
- Computed style sample: `artifacts/chain-computed-style.json`
