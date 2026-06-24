# Technical Review — hafis-fyi Website

Comprehensive audit of the hafis-fyi codebase covering security vulnerabilities, build system, performance, accessibility, code quality, and deployment readiness.

---

## Architecture Summary

| Aspect | Detail |
|---|---|
| **Type** | Static single-page application (SPA) |
| **Build** | Custom Node.js SSG (`build.js`) using `marked` to compile Markdown → HTML |
| **Output** | Single monolithic `index.html` (~113 KB) with inlined CSS |
| **Client routing** | Hash-based SPA (`#about`, `#writing/slug`) |
| **External deps** | KaTeX (CDN), PrismJS (CDN), Google Fonts (CDN) |
| **Contact** | Formspree-based POST form |
| **Hosting** | Not configured — no deployment manifest found |

---

## 🔴 Critical Vulnerabilities & Issues

### 1. XSS via Markdown Content Injection (Build-Time)

The build system passes Markdown content through `marked.parse()` and injects the resulting HTML directly into the page **without any sanitization**.

**Files:** `build.js:86`, `build.js:154-155`, `build.js:217`

If any content Markdown file (e.g., essays, projects) contains embedded `<script>` tags or event handlers, they will be compiled verbatim into `index.html`. Since you control the content, this is low-probability but still a hygiene risk — especially if you ever accept guest posts or automate content ingestion.

**Fix:** Enable `marked`'s built-in sanitizer or pipe output through [DOMPurify](https://github.com/cure53/DOMPurify) at build time.

---

### 2. `node_modules` Committed to Git ✅ FIXED

The entire `node_modules/` directory was tracked in Git. A `.gitignore` has been added and `node_modules/` has been untracked.

---

### 3. Formspree Endpoint is a Placeholder

The contact form action is set to `https://formspree.io/f/your_formspree_id` — a **non-functional placeholder**. Any user submitting the form will get an error.

**File:** `content/profile.json:7`

**Fix:** Replace with your actual Formspree form ID, or implement client-side validation to prevent submission until configured.

---

### 4. Missing Resume PDF

The "Download PDF Resume" button links to `assets/hafis-umar-lawal-resume.pdf`, but **this file does not exist** in the `assets/` directory. Clicking it will yield a 404.

**File:** `src/template.html:142`

Similarly, the three certificate PDFs referenced in `content/profile.json:88-102` are not present (only a README placeholder exists in `assets/certificates/`).

---

## 🟠 Security Hardening

### 5. No Content Security Policy (CSP)

No CSP meta tag or header is configured. The site loads scripts and styles from three different CDN origins (`cdn.jsdelivr.net`, `cdnjs.cloudflare.com`, `fonts.googleapis.com`) with **no Subresource Integrity (SRI) hashes**.

This means:
- A compromised CDN could inject malicious code
- There's no defense-in-depth against XSS

**Fix:** Add SRI `integrity` attributes to all CDN `<script>` and `<link>` tags, and add a CSP meta tag:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com; 
               style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net cdnjs.cloudflare.com; 
               font-src fonts.gstatic.com;">
```

### 6. Inline Event Handlers (`onclick`)

The build system generates `onclick="toggleProjectExpansion('...')"` and `onclick="goBackToSeries('...')"` as inline HTML attributes throughout the output. While the arguments are derived from filenames (low XSS risk), this pattern:

- Prevents strict CSP (`'unsafe-inline'` is required)
- Is a code smell for modern web development

**File:** `build.js:291`, `build.js:378`, `build.js:451`

**Fix:** Use `addEventListener` with `data-*` attributes instead.

### 7. No CSRF Protection on Contact Form

The Formspree form relies solely on a `_gotcha` honeypot field for spam prevention. There is:
- No CAPTCHA (reCAPTCHA, hCaptcha, Turnstile)
- No rate limiting (server-side, depends on Formspree plan)

For a personal site this is acceptable, but worth noting.

---

## 🟡 Performance Issues

### 8. Monolithic Single-File Output ✅ FIXED

The site has been refactored to externalize CSS into a separate cacheable `styles.css` (23.4 KB) and lazy-load article content via `fetch()` from individual HTML fragments under `articles/`. The `index.html` was reduced from 113 KB to ~70.5 KB (–37%). Articles are cached in-memory after first load for instant back-navigation.


### 9. `@import` Inside `<style>` Block ✅ MITIGATED

```css
@import url('https://fonts.googleapis.com/css2?family=Inter...');
```

The CSS is now externalized (no longer inside a `<style>` tag), and `<link rel="preconnect">` hints for `fonts.googleapis.com` and `fonts.gstatic.com` have been added to the `<head>` to warm the connection early. The `@import` itself remains in `styles.css` but no longer causes the double-blocking issue.

### 10. Synchronous Script Loading (PrismJS)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js"></script>
```

These two Prism scripts at `src/template.html:21-22` are loaded **synchronously** (no `defer` or `async`), blocking page rendering. KaTeX scripts correctly use `defer`, but Prism does not.

**Fix:** Add `defer` to both Prism `<script>` tags.

### 11. No Favicon

No `<link rel="icon">` is defined. Browsers will request `/favicon.ico` on every load, generating 404s in server logs and missing the branding opportunity.

---

## 🟢 Code Quality & Maintainability

### 12. Hardcoded Content in Template

The `src/template.html:134-146` has company-specific text hardcoded directly:

```html
<h3>Active Positions at dcbel inc.</h3>
<span>Nov 2022 – Present • Montreal, QC</span>
<p>Operating in a dual capacity as a <strong>Power Electronics Engineer</strong>...</p>
```

This content is **not sourced from `profile.json`** or any Markdown file — it's frozen in the template. When you change roles, this section will be out of sync with the rest of the data.

**Fix:** Move the "current position" bento box content to `profile.json` and template it.

### 13. Hardcoded Bio Paragraph in Build Script

Similarly, `build.js:246` hardcodes a paragraph about RIGA Lab and IRIS CubeSat directly in the build script rather than sourcing it from the content system.

### 14. No Error Handling in Build Script

`build.js` has zero `try/catch` blocks. If any content file is missing, malformed, or contains invalid JSON, the build will crash with an opaque Node.js stack trace.

### 15. Fragile Markdown Parsing

The content parsers (e.g., `parseExperienceFile` in `build.js:51-95`) use fragile string matching like `line.includes('**Company:**')` to extract metadata. This will break if:
- Markdown formatting changes slightly
- A content body happens to contain `**Company:**`

**Fix:** Use YAML frontmatter (standard in SSGs) and parse with a proper frontmatter library.

### 16. No `.gitignore` File ✅ FIXED

A `.gitignore` has been created covering `node_modules/`, OS files, and editor configs.

---

## 🔵 Accessibility

### 17. Minimal ARIA / Semantic Markup

| Element | Issue |
|---|---|
| Navigation | `<nav>` exists but no `role="navigation"` or `aria-label` |
| Page sections | Use `display: none` toggling — screen readers may miss content |
| Form | Labels are present ✅, but no `aria-describedby` for error states |
| Expandable panels | `onclick` toggles use no `aria-expanded`, `aria-controls`, or keyboard support |
| Skip navigation | No "Skip to content" link |
| Focus management | Route changes don't manage focus — keyboard users get lost after navigation |
| Color contrast | `--text-muted: #8b5cf6` (purple) on white bg may fail WCAG AA (4.5:1 ratio) |

### 18. Keyboard Accessibility

The expandable sections ("Read Full Case Study", "Explore Series") use `<a href="javascript:void(0)">` with `onclick` handlers. These are:
- Not keyboard-accessible `<button>` elements
- Not reachable via `Enter`/`Space` key natively
- Missing `role="button"` and `tabindex`

---

## 📋 Summary Table

| # | Issue | Severity | Category | Status |
|---|---|---|---|---|
| 1 | Unsanitized Markdown → HTML injection | 🔴 Critical | Security | Open |
| 2 | `node_modules` in Git, no `.gitignore` | 🔴 Critical | Repository | ✅ Fixed |
| 3 | Formspree placeholder endpoint | 🔴 Critical | Functionality | Open |
| 4 | Missing PDF assets (resume + certs) | 🟠 High | Functionality | Open |
| 5 | No CSP or SRI hashes on CDN resources | 🟠 High | Security | Open |
| 6 | Inline `onclick` handlers | 🟡 Medium | Security/Quality | Open |
| 7 | No CAPTCHA on contact form | 🟡 Medium | Security | Open |
| 8 | 113 KB monolithic HTML | 🟡 Medium | Performance | ✅ Fixed |
| 9 | `@import` in `<style>` block | 🟡 Medium | Performance | ✅ Mitigated |
| 10 | Synchronous Prism script loading | 🟡 Medium | Performance | Open |
| 11 | No favicon | 🟢 Low | UX | Open |
| 12 | Hardcoded template content | 🟡 Medium | Maintainability | Open |
| 13 | Hardcoded bio in build script | 🟡 Medium | Maintainability | Open |
| 14 | No error handling in build | 🟡 Medium | Reliability | Open |
| 15 | Fragile string-based frontmatter parsing | 🟡 Medium | Reliability | Open |
| 16 | Missing `.gitignore` | 🔴 Critical | Repository | ✅ Fixed |
| 17 | Poor ARIA / semantic markup | 🟡 Medium | Accessibility | Open |
| 18 | Keyboard inaccessibility | 🟡 Medium | Accessibility | Open |

---

## What's Done Well

- ✅ **Dark mode implementation** — early `<script>` in `<head>` prevents FOUC, `localStorage` persistence
- ✅ **Semantic HTML** — proper use of `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`
- ✅ **`rel="noopener noreferrer"`** on all `target="_blank"` links (prevents tab-nabbing)
- ✅ **CSS custom properties** — clean design token system with consistent theming
- ✅ **Form labels** — all form fields have associated `<label>` elements with `for` attributes
- ✅ **Responsive design** — media queries at 600px, 768px, 992px breakpoints
- ✅ **Hash-based routing** — clean SPA routing with proper fallback to `#about`
- ✅ **Lazy code highlighting / math rendering** — Prism and KaTeX only process content when visible
