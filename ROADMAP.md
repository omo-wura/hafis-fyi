# Website Roadmap & Future Enhancements

This document outlines potential future features, visual upgrades, and SEO improvements for the portfolio site.

---

## 1. Search Engine Optimization & Rich Snippets
* **Open Graph (OG) Meta Tags**: Add standard OG tags (`og:title`, `og:description`, `og:image`, `og:url`) to the `<head>` of `template.html`. This ensures that when the link is shared on LinkedIn or Twitter/X, it renders a sleek visual preview card (featuring your headshot and role title) instead of a plain text URL.
* **JSON-LD Schema Markup**: Embed structured data schema (`Person`, `ProfilePage`, `ScholarlyArticle`, and `Patent` types) using a `<script type="application/ld+json">` block. This explicitly conveys your credentials, patents, and thesis details to Google Search crawlers, improving search page indexing.

---

## 2. Interactive Demos ("Show, Don't Tell") & Strategic Concerns
### Conceptual Idea
Add client-side interactive calculators or visualizers in Vanilla JS (e.g., an EMI/EMC filter designer, a heatsink junction-temperature calculator, or a bidirectional converter efficiency curve plotter).

### Critical Concerns & Constraints
* **Employer IP Sensitivity**: Building highly functional, free engineering calculators can sometimes raise concerns with current or future employers. Some companies may prefer to own or restrict public access to tools that could be perceived as proprietary design accelerators or trade secrets.
* **Dilution of Website Focus**: The primary focus of this portfolio is to showcase **high-level architectural design, failure forensics (such as gate-driver and desaturation debugs), and lifecycle governance (ECO/PLM, standards compliance)**. Turning the site into a directory of helper utilities could dilute this messaging and redirect visitor attention from your operational engineering accomplishments to simple script maintenance.
* **Strategic Guideline**: If interactive tools are built, keep them strictly conceptual, educational, and focused on demonstrating basic physics principles (e.g., visualizing magnetic flux paths, simple thermal resistance models) rather than complete design engines.

---

## 3. Print-Ready CV Styling
* **Print Stylesheet**: Add a `@media print` query to `styles.css`.
* **Behavior**: When a recruiter or hiring manager prints the CV section (or saves it as a PDF from the browser using `Ctrl + P`), the stylesheet should automatically:
  * Hide header navigation and social icon links.
  * Adjust fonts and paddings for a standard paper layout.
  * Format the professional timeline and skills columns into a clean, paginated, two-page resume format.

---

## 4. Privacy-First Analytics
* **Cookie-less tracking**: Integrate a privacy-respecting, lightweight analytics service (such as Plausible, Fathom, or Umami).
* **Benefit**: Allows you to track resume download triggers, certificate view rates, and forensics essay reading statistics without needing to display intrusive, conversion-killing GDPR cookie banners.

---

## 5. Offline Support (Progressive Web App) ✅ Implemented
* **Service Worker**: A build-generated `sw.js` caches core SPA assets (HTML, CSS, manifest, CDN stylesheets) on install with a cache-first strategy. Article fragments are runtime-cached on first read. Each `npm run build` generates a fresh cache version for automatic invalidation.
* **PWA Manifest**: `manifest.json` is auto-generated from `profile.json` with standalone display mode.
* **Benefit**: The entire portfolio loads instantaneously on repeat visits, even offline. Previously-read articles remain available without connectivity.
