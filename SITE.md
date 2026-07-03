# coderippletech.com — how this site works

Static site, no build step. Served by Cloudflare Pages (project
`coderipple-site`); every push to `main` auto-deploys via GitHub Actions.

## Layout

```
/                    index.html — company page, one card per product
/ripplebug/          product page (+ /ripplebug/privacy/)
/ripple-import/      product page
/_template/product/  copy-me skeleton for the next product
site.css             shared design system (dark, Inter, accent variables)
style.css            legacy stylesheet for the guide page only
assets/              logos, screenshots (shot-<slug>*.png)
```

**Never move these root files** — the monday.com marketplace links to them:
`monday-app-association.json`, `privacy.html`, `terms.html`, `guide.html`.
A second monday app registers itself by adding its clientID to the `apps`
array in the association JSON.

## Adding a product (10 minutes)

1. Copy `_template/product/` to `/<slug>/` and fill in the `{{ }}` markers.
2. Pick the accent color in the `<style>` block at the top of the page —
   that one variable re-skins buttons, icons, gradients, everything.
   Taken: teal (Ripplebug), purple (Ripple Import).
3. Drop the product logo at `assets/<slug>-logo.png` and screenshots at
   `assets/shot-<slug>*.png`. Real screenshots beat mockups.
4. Add a product card to the grid in `index.html` (copy an existing one,
   swap the copy, logo, link, and give the card its own hover class if you
   want a tinted glow).
5. If it needs a privacy page: copy `/ripplebug/privacy/index.html`.
6. Push. The GitHub Action deploys to Cloudflare Pages automatically.

## Writing style

Short declarative sentences. Say the pain, then the fix. Avoid em-dash
chains and filler adjectives. Read it out loud once before shipping.

## When to change the architecture

Only when there is a blog/docs section or more than ~5 products — then port
this same content into Astro on Cloudflare Pages. Not before.
