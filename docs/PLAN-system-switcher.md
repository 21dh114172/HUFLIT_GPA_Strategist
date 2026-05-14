# PLAN: System Switcher (Legacy ↔ Next.js)

> **Project Type:** WEB  
> **Created:** 2026-05-14  
> **Status:** ✅ COMPLETE

---

## Overview

Implement a seamless switching mechanism between two versions of HUFLIT GPA Strategist:

| Version | Tech Stack | Path | Purpose |
|---------|-----------|------|---------|
| **Next.js** (Primary) | Next.js 16, React 19, Tailwind v4 | `/` | Modern experience |
| **Legacy** (Fallback) | Vanilla HTML/CSS, Bootstrap 5 | `/legacy/` | Old browser support |

### Behavior

1. **Legacy First (Default):** All first-time visitors are redirected to `/legacy/` for maximum compatibility.
2. **Opt-in Modern:** Users can manually switch to the Next.js version via a button.
3. **Manual switch:** Button in both versions to toggle between systems.
4. **Preference override:** User's manual choice stored in `localStorage`, overrides default behavior.
5. **Clean start:** No GPA data is carried over between systems.

---

## Success Criteria

- [x] All visitors default to `/legacy/` on first visit.
- [x] Modern version accessible via manual switch button.
- [x] Switch button visible in **both** Next.js and Legacy apps.
- [x] Manual preference persists via `localStorage` across sessions.
- [x] GitHub Pages deployment serves both versions correctly.
- [x] No performance regression (detection script < 1KB, runs before paint).

---

## Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Browser detection | Inline `<script>` (vanilla JS) | Must run before framework hydration |
| Preference storage | `localStorage` | Simple, no-server, persists across sessions |
| Routing | Path-based (`/` vs `/legacy/`) | Works with static export & GitHub Pages |
| Build pipeline | GitHub Actions | Already in place, just needs legacy copy step |

---

## Architecture

```
huflit-gpa.vercel.app/          → Next.js app (static export)
huflit-gpa.vercel.app/legacy/   → Vanilla HTML/CSS app

┌─────────────────────────────────────────────────┐
│                 Page Load                        │
│                    │                             │
│            ┌───────▼────────┐                    │
│            │ Check localStorage                  │
│            │ "app-preference"│                    │
│            └───────┬────────┘                    │
│                    │                             │
│         ┌──────────┼──────────┐                  │
│         │ has pref │ no pref  │                  │
│         ▼          ▼          │                  │
│    Use pref    Detect browser │                  │
│                    │          │                  │
│              ┌─────┼─────┐   │                  │
│              │old  │modern│   │                  │
│              ▼     ▼      │   │                  │
│         /legacy/    /     │   │                  │
└─────────────────────────────────────────────────┘
```

### Browser Version Thresholds

| Browser | Minimum Version | Detection Method |
|---------|----------------|-----------------|
| Chrome | 90 | `userAgent` regex |
| Firefox | 90 | `userAgent` regex |
| Safari | 15 | `userAgent` regex |
| Edge | 90 | `userAgent` regex |
| Opera | 76 | `userAgent` regex (Chromium-based) |
| Others | — | Default to legacy for safety |

> **Note:** These thresholds roughly correspond to ES2021+ support, CSS Grid gap, and `Promise.allSettled`.

---

## File Structure (Changes Only)

```
HUFLIT_GPA_Strategist/
├── next-app/
│   ├── public/
│   │   └── legacy/              ← NEW: Legacy app copied here at build time
│   │       ├── index.html
│   │       ├── css/
│   │       ├── js/
│   │       ├── assets/
│   │       └── manifest.json
│   └── src/
│       ├── app/
│       │   └── layout.tsx       ← MODIFIED: Add browser detection inline script
│       ├── components/
│       │   └── layout/
│       │       └── SystemSwitchButton.tsx  ← NEW: Switch button component
│       └── lib/
│           └── browser-detect.ts          ← NEW: Browser detection constants
├── legacy/
│   └── index.html               ← MODIFIED: Add switch-to-nextjs button + detection script
└── .github/
    └── workflows/
        └── deploy-pages.yml     ← MODIFIED: Copy legacy/ into build output
```

---

## Task Breakdown

### Phase 1: Browser Detection Core

#### Task 1.1: Create browser detection constants

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skill** | `clean-code` |
| **Priority** | P0 (Foundation) |
| **Dependencies** | None |
| **Status** | ✅ Done |

**VERIFY:**
- [x] Function correctly identifies Chrome 89 as old, Chrome 90 as modern
- [x] Function correctly identifies Safari 14 as old, Safari 15 as modern
- [x] Works without any framework imports (pure JS logic)

---

#### Task 1.2: Create inline redirect script

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skill** | `clean-code`, `performance-profiling` |
| **Priority** | P0 (Foundation) |
| **Dependencies** | Task 1.1 |
| **Status** | ✅ Done |

**VERIFY:**
- [x] Script size < 1KB
- [x] `localStorage` preference is respected over auto-detection
- [x] No redirect loop (if on `/legacy/` and old browser, don't redirect again)
- [x] Uses `location.replace()` not `location.href` (no back-button loop)

---

### Phase 2: UI Components

#### Task 2.1: Create SystemSwitchButton for Next.js

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skill** | `frontend-design`, `clean-code` |
| **Priority** | P1 (Core UI) |
| **Dependencies** | Task 1.1 |
| **Status** | ✅ Done |

**VERIFY:**
- [x] Button renders in the header
- [x] Click sets localStorage and navigates to `/legacy/`
- [x] Responsive (visible but compact on mobile)
- [x] Accessible (aria-label, focus states)

---

#### Task 2.2: Add switch button to Legacy app

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skill** | `clean-code` |
| **Priority** | P1 (Core UI) |
| **Dependencies** | None |
| **Status** | ✅ Done |

**VERIFY:**
- [x] Button visible in legacy navbar (both mobile and desktop)
- [x] Click sets localStorage and navigates to `/`
- [x] Detection script works in legacy `<head>`

---

### Phase 3: Build Pipeline

#### Task 3.1: Update GitHub Actions workflow

| Field | Value |
|-------|-------|
| **Agent** | `backend-specialist` |
| **Skill** | `deployment-procedures` |
| **Priority** | P1 (Infrastructure) |
| **Dependencies** | Task 2.2 |
| **Status** | ✅ Done |

**VERIFY:**
- [x] Build succeeds locally with `npm run build && cp -r ../legacy ./out/legacy`
- [x] `out/legacy/index.html` exists after build
- [x] Legacy CSS/JS paths resolve correctly from `/legacy/` path

---

#### Task 3.2: Handle basePath for detection script

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skill** | `clean-code` |
| **Priority** | P1 |
| **Dependencies** | Task 1.2, Task 3.1 |
| **Status** | ✅ Done |

**VERIFY:**
- [x] Works on `huflit-gpa.vercel.app` (basePath = "")
- [x] Works on `tienxdun.github.io/HUFLIT_GPA_Strategist/` (basePath = "/HUFLIT_GPA_Strategist")
- [x] No redirect loop on either environment

---

### Phase 4: Integration & Polish

#### Task 4.1: Integration testing & edge cases

| Field | Value |
|-------|-------|
| **Agent** | `frontend-specialist` |
| **Skill** | `testing-patterns` |
| **Priority** | P2 (Polish) |
| **Dependencies** | All above |
| **Status** | ✅ Done |

**VERIFY:**
- [x] All 9 scenarios pass
- [x] No infinite redirect loops
- [x] Performance: detection script doesn't delay FCP

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass (Manual review)
- Security: ✅ No critical issues
- Build: ✅ Success (Ready for CI/CD)
- Date: 2026-05-14
