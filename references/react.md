# React Security Checklist

Framework-specific checks for React applications (CRA, Vite, standalone React). Run after the universal checklist. For Next.js, use `nextjs.md` instead.

---

## R1 — XSS & DOM Injection
- [ ] **R1.1** — No `dangerouslySetInnerHTML` with unescaped or unsanitised user data
- [ ] **R1.2** — All `dangerouslySetInnerHTML` usage sanitised with DOMPurify before render
- [ ] **R1.3** — No `document.write()` or `innerHTML =` with user data
- [ ] **R1.4** — Dynamic `href` values validated — prevent `javascript:` URI injection (`href={userInput}`)
- [ ] **R1.5** — `eval()`, `new Function()`, `setTimeout(string)` not used with user input

## R2 — Secrets & Environment Variables
- [ ] **R2.1** — No secrets, private API keys, or backend credentials in client-side code or `.env` files for the frontend bundle
- [ ] **R2.2** — `.env` files with `REACT_APP_` or `VITE_` prefixed vars reviewed — these are bundled into the client
- [ ] **R2.3** — Public API keys (maps, analytics) have domain restrictions / referrer restrictions configured at the provider
- [ ] **R2.4** — No sensitive logic performed client-side that should be server-side (price calculations, access control decisions)

## R3 — Authentication Token Handling
- [ ] **R3.1** — JWT / auth tokens stored in memory or HttpOnly cookies — not `localStorage` or `sessionStorage`
- [ ] **R3.2** — Tokens not exposed in URL query parameters (visible in browser history and server logs)
- [ ] **R3.3** — Auto-logout on token expiry implemented client-side
- [ ] **R3.4** — Sensitive routes redirect to login if token is missing or invalid — not just hidden from the UI

## R4 — API Communication
- [ ] **R4.1** — All API calls use HTTPS — no HTTP endpoints in production
- [ ] **R4.2** — `Authorization` header sent correctly — not in URL params
- [ ] **R4.3** — API error responses do not leak sensitive server-side detail in the UI
- [ ] **R4.4** — No hardcoded API base URLs pointing to localhost or dev environments in production builds
- [ ] **R4.5** — CORS errors handled gracefully — not worked around with browser extensions or proxy hacks in production

## R5 — Third-Party Scripts & Dependencies
- [ ] **R5.1** — `npm audit` run; no high/critical CVEs in dependencies
- [ ] **R5.2** — `package-lock.json` committed and up to date
- [ ] **R5.3** — Third-party scripts loaded via `<script>` tags use Subresource Integrity (SRI) hashes
- [ ] **R5.4** — No unvetted third-party components with DOM manipulation (supply chain risk)
- [ ] **R5.5** — `react`, `react-dom`, and router packages up to date (security patches)

## R6 — Routing & Access Control
- [ ] **R6.1** — Protected routes check authentication state from a trusted source (server-verified token, not just local flag)
- [ ] **R6.2** — Role-based route access validated server-side on every API call — client-side route hiding is UI only, not security
- [ ] **R6.3** — No sensitive data passed in URL hash or query string (visible in history, referrer headers)

## R7 — Form Handling
- [ ] **R7.1** — File input types validated client-side (UX) AND server-side (security)
- [ ] **R7.2** — Form submissions debounced or disabled after first submit (prevent double-submission / replay)
- [ ] **R7.3** — Sensitive form fields (password) use `type="password"` — not `type="text"`
- [ ] **R7.4** — Autocomplete disabled on sensitive fields (`autoComplete="new-password"` for passwords)

## R8 — Content Security Policy
- [ ] **R8.1** — CSP header set at the server/CDN level restricting `script-src` to own domain
- [ ] **R8.2** — No `unsafe-inline` in CSP `script-src` (use nonces or hashes instead)
- [ ] **R8.3** — No `unsafe-eval` in CSP unless explicitly required (prevents eval-based XSS)

## R9 — Build & Deployment
- [ ] **R9.1** — Source maps not exposed publicly in production (`GENERATE_SOURCEMAP=false` for CRA, `build.sourcemap: false` for Vite)
- [ ] **R9.2** — Build output does not include `.env` files or raw config with secrets
- [ ] **R9.3** — CDN or hosting platform serves `X-Content-Type-Options: nosniff` and `X-Frame-Options` headers
- [ ] **R9.4** — React version is current LTS — not an EOL version with unpatched CVEs

## R10 — `postMessage` Security
- [ ] **R10.1** — `window.addEventListener('message', ...)` handlers validate `event.origin` against an allowlist before processing data
- [ ] **R10.2** — `postMessage` calls specify a target origin (not `'*'`) when sending sensitive data
- [ ] **R10.3** — Data received via `postMessage` is validated/sanitised before use — not blindly trusted

## R11 — Prototype Pollution
- [ ] **R11.1** — No deep-merge of user-controlled input into objects without sanitisation (e.g. lodash `_.merge`, `_.defaultsDeep` with raw user data)
- [ ] **R11.2** — Properties named `__proto__`, `constructor`, and `prototype` rejected or stripped from user input before object assignment
- [ ] **R11.3** — `Object.create(null)` or `Map` used for user-keyed dictionaries instead of plain objects where feasible

## R12 — WebSocket Authentication
- [ ] **R12.1** — If WebSockets are used, authentication is validated on the connection handshake — not assumed from page-level auth
- [ ] **R12.2** — WebSocket messages are validated and sanitised — not blindly processed
- [ ] **R12.3** — WebSocket connections are closed on token expiry or logout