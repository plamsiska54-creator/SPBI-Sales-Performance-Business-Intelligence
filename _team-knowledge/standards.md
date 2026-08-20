# Team Standards

## Project: SPBI (Sales Performance & Business Intelligence Platform)

### Code Standards
- Language: Thai UI, English code
- Framework: TBD (pending architect decision)
- File encoding: UTF-8 without BOM
- Security: SHA-256 for secrets, never hardcode credentials
- CSS: External files, no inline styles in HTML
- JS: External files, modular structure

### Git Standards
- Branch naming: `feature/<name>`, `fix/<name>`, `refactor/<name>`
- Commit messages: Thai description, conventional commits prefix
- Always create PR for review before merging to main

### Quality Gates
- No JS console errors
- All tabs/pages load within 5 seconds
- Responsive: desktop + tablet + mobile
- PIN/credentials never in plaintext

### SPA Module Pattern (for new projects / prototypes)
- Pattern: Micro-module SPA -- single HTML shell + tab modules with `mount(container)` / `unmount()`
- Use ES Modules (`<script type="module">`) -- no build tool needed for small projects
- Chart management: always use chart registry pattern (Map: canvasId -> instance) with `destroyAll()` on unmount
- Async render guard: use mountId counter to prevent stale renders from race conditions during tab switches
- Chart.js loading: prefer local UMD file (`chart.umd.js`) over CDN to avoid CSP issues -- install via npm then copy to public/
- Filter state: module-level singleton is sufficient for simple SPAs (no state library needed)
- Prototypes: isolate in `prototype/<name>/` with own server.js + package.json

### Existing Codebase
- Current: Single-file dashboard split into HTML + CSS + JS (Phase A+B completed)
- Remote: https://github.com/wwnerpapp/Sales_dashboard.git
- Branch: main (current), refactor/phase-ab (pending PR)
