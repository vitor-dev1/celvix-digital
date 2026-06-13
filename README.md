# Celvix Partners

> We grow real estate agents into market leaders.

A premium static marketing site for **Celvix Partners**, a real-estate Social Media Marketing Agency (SMMA). We partner with agents on a commission basis — **0.5% per closed sale, negotiated individually** — so we only win when the agent wins.

## Stack

Pure static site — no build step, no dependencies.

- **HTML5** — semantic, multi-page
- **CSS** — custom design system (warm dark theme, gold `#C9A96E`, Playfair Display + Sora + Inter)
- **Vanilla JS** — custom cursor, IntersectionObserver scroll reveals, animated counters, marquee, mobile menu, glassmorphism nav

## Structure

```
celvix-digital/
├─ index.html          Home (hero, services, about, process, testimonials, CTA)
├─ css/style.css       Design system & all components
├─ js/main.js          Interactions
└─ pages/
   ├─ services.html    6 services in detail + commission model
   ├─ about.html       Story, values, team
   ├─ contact.html     Partner application form
   ├─ privacy.html     Privacy policy (GDPR / CCPA)
   └─ terms.html       Partnership terms & commission clauses
```

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# visit http://localhost:8000
```

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages, enable Pages on the `master` branch in repo settings.

## Images

Hero, testimonial avatars, and team photos are real photography served from the [Pexels](https://pexels.com) CDN, hardcoded as static `<img>` URLs (no runtime API calls or keys in the page).

---

© Celvix Partners. Managed by **VREH DIGITAL LLC**.
