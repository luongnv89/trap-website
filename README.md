# Trap / Cạm Bẫy — landing site

A dependency-free English/Vietnamese landing site for **Trap**, the hidden-trap mobile platformer. The production target is:

- English: <https://luongnv.com/trap-website/>
- Vietnamese: <https://luongnv.com/trap-website/vi/>

### Public submission pages

| Purpose | English | Vietnamese |
| --- | --- | --- |
| Support / issue forms | <https://luongnv.com/trap-website/support/> | <https://luongnv.com/trap-website/vi/support/> |
| Privacy notice | <https://luongnv.com/trap-website/privacy/> | <https://luongnv.com/trap-website/vi/privacy/> |
| Changelog | <https://luongnv.com/trap-website/changelog/> | <https://luongnv.com/trap-website/vi/changelog/> |

The store section is intentionally informational: Google Play and Apple App Store are both **coming soon**, with no fabricated download links, dates, prices, ratings, or testimonials.

## Run locally

No build step is required. From this directory:

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/
node scripts/validate.mjs
```

The validator checks all eight HTML documents, local links/assets, bilingual metadata, canonical and hreflang URLs, JSON-LD, issue-form templates, the social-card dimensions, sitemap, robots, and the GitHub links. There are no runtime dependencies or third-party trackers.

## App-store follow-up

These support, privacy and changelog URLs are website routes prepared for store submission; linking them from the shipped app and its store listings is a separate integration step outside this static-site batch. Before release, sync the in-app privacy link and Google Play / Apple App Store privacy labels with the current game policy and shipped dependencies. This site is not a full legal, SDK or store-review audit and does not guarantee approval.

## Deployment

`.github/workflows/pages.yml` validates the site and deploys only the public HTML, styles, scripts, assets, and crawler files with GitHub Actions Pages on pushes to `main` (and manual dispatch). The repository Pages setting must use **GitHub Actions** as its source. The workflow grants Pages write and OIDC identity-token permissions, uses the `pages` concurrency group, and publishes the staged `_site` artifact.

If the repository owner, repository name, or canonical host changes, update all of these together:

- `<link rel="canonical">`, hreflang links, Open Graph URLs, JSON-LD URLs and image URLs in `index.html` and `vi/index.html`
- `sitemap.xml`, `robots.txt`, `llms.txt`, this README, and the workflow/Pages setting if needed
- the social-card URL and any absolute links in validation expectations

`robots.txt` is scoped to the `/trap-website/` project path when served by GitHub Pages; it is not a domain-root robots policy. A domain owner should maintain any separate root-level policy.

## Content provenance

The game facts are transcribed from the companion Flutter source repository’s [`README.md`](https://github.com/nguyenvanlamm/cam_bay/blob/master/README.md), [`README.vi.md`](https://github.com/nguyenvanlamm/cam_bay/blob/master/README.vi.md), and the palette/tuning/world-painter files. Those sources establish the 12 levels, three acts, 13 trap types, battery economy, Scan/EMP costs and ranges, checkpoint memory, power-core alarm, and crusher escape. The maintainer confirmed planned Google Play and Apple App Store availability; neither listing is live yet. The hero artwork and social card are original site illustrations; the caption explicitly identifies the hero as an illustration, not a gameplay screenshot.

Development source: <https://github.com/nguyenvanlamm/cam_bay>. Ownership, store links, release wording, or canonical URLs should only be changed when verified by the project owner. Replace the two non-link store status labels with real store URLs only after each listing is public and verified.

## Small future experiments

Keep any A/B work factual and reversible. Possible experiments are (A) the current editorial hero versus a shorter mechanic-first hero, or (B) a single CTA versus the current Explore + release-status pairing. Do not add analytics, cookies, fake proof, or unverified launch claims just to measure a variant.
