# Next.js Security Checklist

Framework-specific checks for Next.js applications (App Router and Pages Router). Run after the universal checklist.

---

## N1 — Environment Variables
- [ ] **N1.1** — `NEXT_PUBLIC_` prefix used only for non-sensitive values (anything prefixed is exposed to the browser bundle)
- [ ] **N1.2** — Secret keys (DB passwords, API secrets, signing keys) use server-only env vars (no `NEXT_PUBLIC_` prefix)
- [ ] **N1.3** — `.env.local` in `.gitignore`; `.env.example` contains no real secrets
- [ ] **N1.4** — Environment variables validated at startup (e.g. with `zod` schema) to fail fast on misconfiguration

## N2 — API Routes & Route Handlers
- [ ] **N2.1** — Every API route (`pages/api/` or `app/api/`) validates the HTTP method explicitly
- [ ] **N2.2** — Authentication checked on every protected API route — not just the frontend page
- [ ] **N2.3** — `Authorization` header or session cookie validated before returning data
- [ ] **N2.4** — No sensitive data returned for unauthenticated requests (check default error shapes)
- [ ] **N2.5** — Route Handlers (App Router) use `NextResponse` — not raw `Response` with CORS headers accidentally set to `*`

## N3 — Server Actions (App Router)
- [ ] **N3.1** — Server Actions include authentication and authorisation checks — they are public endpoints
- [ ] **N3.2** — Server Actions validate all input (treat as untrusted user input, not internal calls)
- [ ] **N3.3** — No secrets or privileged logic exposed through Server Action return values to the client

## N4 — Middleware
- [ ] **N4.1** — `middleware.ts` protects all authenticated routes (not just a subset)
- [ ] **N4.2** — Middleware matcher config does not accidentally exclude sensitive paths
- [ ] **N4.3** — Auth checks in middleware are verified server-side (JWT signature, session lookup) — not just cookie presence

## N5 — next.config.js / next.config.ts
- [ ] **N5.1** — `headers()` configured with security headers (CSP, HSTS, X-Frame-Options, etc.)
- [ ] **N5.2** — `images.remotePatterns` is restrictive — not `domains: ['*']`
- [ ] **N5.3** — `rewrites()` and `redirects()` do not create open redirect vulnerabilities
- [ ] **N5.4** — `reactStrictMode: true` enabled (catches unsafe patterns in development)
- [ ] **N5.5** — Source maps disabled or access-restricted in production (`productionBrowserSourceMaps: false`)

## N6 — XSS & Rendering
- [ ] **N6.1** — No `dangerouslySetInnerHTML` with unsanitised user content
- [ ] **N6.2** — `dangerouslySetInnerHTML` usage audited — sanitised with DOMPurify or similar before use
- [ ] **N6.3** — Dynamic routes do not pass raw path params into HTML without encoding
- [ ] **N6.4** — Open Graph / meta tags do not reflect user input without encoding

## N7 — Authentication (NextAuth / Auth.js / Custom)
- [ ] **N7.1** — `NEXTAUTH_SECRET` is a strong, unique secret in production
- [ ] **N7.2** — `NEXTAUTH_URL` matches actual production URL (prevents redirect attacks)
- [ ] **N7.3** — `callbacks.session` and `callbacks.jwt` do not expose sensitive data in the client session
- [ ] **N7.4** — OAuth `state` parameter validated (CSRF on OAuth flow) — Auth.js does this by default; verify if custom
- [ ] **N7.5** — Signed-out users cannot access protected pages via direct URL (check `getServerSession` on protected pages/layouts)

## N8 — Data Fetching
- [ ] **N8.1** — `fetch` calls to internal APIs from Server Components pass auth credentials correctly
- [ ] **N8.2** — No user-controlled input passed unsanitised into `fetch` URLs (SSRF risk)
- [ ] **N8.3** — `cache: 'no-store'` or revalidation strategy appropriate for sensitive data (avoid caching personalised data globally)
- [ ] **N8.4** — External API responses validated before use — not blindly trusted

## N9 — CORS
- [ ] **N9.1** — CORS headers on API routes are explicit — not `Access-Control-Allow-Origin: *` on authenticated endpoints
- [ ] **N9.2** — Preflight OPTIONS requests handled correctly

## N10 — Dependencies & Build
- [ ] **N10.1** — `npm audit` run; no high/critical CVEs
- [ ] **N10.2** — `package-lock.json` or `yarn.lock` committed
- [ ] **N10.3** — No client-side bundle exposure of server secrets (use `server-only` package for server-only modules)
- [ ] **N10.4** — `next build` output does not include `.env` files

## N11 — `__NEXT_DATA__` Prop Exposure
- [ ] **N11.1** — `getServerSideProps` / `getStaticProps` do not return sensitive data in props (full props object is serialized into the page HTML as `__NEXT_DATA__` JSON)
- [ ] **N11.2** — Only the minimum required data passed as props — no full database records with internal fields
- [ ] **N11.3** — Server Components (App Router) do not pass sensitive data as props to Client Components (serialized into RSC payload)

## N12 — ISR Revalidation Secret
- [ ] **N12.1** — On-demand ISR revalidation endpoints (`/api/revalidate`) protected with a secret token
- [ ] **N12.2** — Revalidation secret stored in environment variable — not hardcoded
- [ ] **N12.3** — Revalidation secret is high-entropy and not guessable

## N13 — `server-only` Guard Enforcement
- [ ] **N13.1** — Database clients (`prisma`, `drizzle`, `pg`, etc.) import `server-only` at the module level to prevent accidental client-side bundling
- [ ] **N13.2** — Modules that read secrets (`process.env.SECRET_*`) import `server-only`
- [ ] **N13.3** — Utility files shared between server and client do not accidentally export server-only functions