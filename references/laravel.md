# Laravel Security Checklist

Framework-specific checks for Laravel applications. Run after the universal checklist.

---

## L1 — Authentication & Laravel Sanctum / Passport
- [ ] **L1.1** — Sanctum/Passport tokens stored securely; not returned in URL params
- [ ] **L1.2** — Token expiry configured (`expiration` in `sanctum.php`)
- [ ] **L1.3** — `auth` middleware applied to all protected routes — verify in `routes/api.php` and `routes/web.php`
- [ ] **L1.4** — `verified` middleware on routes requiring email verification
- [ ] **L1.5** — Default Laravel auth scaffolding not left in with default passwords

## L2 — CSRF Protection
- [ ] **L2.1** — `VerifyCsrfToken` middleware active in `Kernel.php` (not removed from global middleware)
- [ ] **L2.2** — API routes that modify state use token-based auth (not relying on session-based CSRF only)
- [ ] **L2.3** — AJAX requests send `X-CSRF-TOKEN` or `_token` header

## L3 — Mass Assignment
- [ ] **L3.1** — All Eloquent models define `$fillable` (allowlist) — not `$guarded = []`
- [ ] **L3.2** — No `Model::create($request->all())` without prior validation and fillable guard
- [ ] **L3.3** — `$hidden` set on models with sensitive fields (password, remember_token, API keys)

## L4 — SQL Injection
- [ ] **L4.1** — No raw query strings with user input: `DB::statement("... $userInput ...")`
- [ ] **L4.2** — `whereRaw`, `orderByRaw`, `selectRaw` do not concatenate user input — use bindings
- [ ] **L4.3** — Eloquent ORM used for standard queries (parameterised by default)

## L5 — XSS
- [ ] **L5.1** — Blade `{{ $var }}` used (auto-escaped) not `{!! $var !!}` with user data
- [ ] **L5.2** — Any `{!! !!}` usage audited — only used with trusted/sanitised content
- [ ] **L5.3** — User-supplied HTML sanitised with a library (e.g. HTMLPurifier) before storage

## L6 — File Uploads
- [ ] **L6.1** — Uploaded files stored via `Storage::disk()` — not directly in `public/`
- [ ] **L6.2** — MIME type validated with `mimes:` or `mimetypes:` rule (not just extension)
- [ ] **L6.3** — File size limited with `max:` validation rule
- [ ] **L6.4** — Uploaded filenames sanitised / replaced with random names (`hashName()`)
- [ ] **L6.5** — PHP execution disabled in the upload directory (`.htaccess` or server config)

## L7 — Environment & Config
- [ ] **L7.1** — `APP_DEBUG=false` in production (`.env` or `config/app.php`)
- [ ] **L7.2** — `APP_ENV=production` in production
- [ ] **L7.3** — `APP_KEY` is a unique, strong value (32 bytes base64) — not the default
- [ ] **L7.4** — `.env` in `.gitignore`; `.env.example` has no real secrets
- [ ] **L7.5** — Database credentials not hardcoded in `config/database.php`

## L8 — Route & Middleware
- [ ] **L8.1** — No sensitive routes left open via `Route::any()` or wildcard patterns unintentionally
- [ ] **L8.2** — `throttle` middleware on login, password reset, and API routes
- [ ] **L8.3** — Route model binding used (prevents manual ID lookups that may skip auth checks)
- [ ] **L8.4** — Policies or Gates used for authorisation — not manual `if ($user->id == $resource->user_id)` scattered through controllers

## L9 — Password Reset & Email
- [ ] **L9.1** — Password reset tokens expire (default 60 min — check `config/auth.php`)
- [ ] **L9.2** — Reset tokens are single-use (invalidated after use)
- [ ] **L9.3** — Reset endpoint rate-limited

## L10 — Session
- [ ] **L10.1** — `SESSION_DRIVER` not `cookie` in production (prefer `database` or `redis`)
- [ ] **L10.2** — `SESSION_SECURE_COOKIE=true` in production
- [ ] **L10.3** — `SESSION_HTTP_ONLY=true`
- [ ] **L10.4** — Session regenerated on login (`$request->session()->regenerate()`)

## L11 — Logging & Telescope
- [ ] **L11.1** — Laravel Telescope disabled or access-restricted in production
- [ ] **L11.2** — Log files not accessible via web (stored outside `public/`)
- [ ] **L11.3** — No passwords or tokens logged by custom code

## L12 — Dependencies
- [ ] **L12.1** — `composer audit` run; no known CVEs in dependencies
- [ ] **L12.2** — `composer.lock` committed
- [ ] **L12.3** — Dev-only packages (`barryvdh/laravel-debugbar`, etc.) excluded from production via `--no-dev`

## L13 — Insecure Deserialization
- [ ] **L13.1** — No `unserialize()` called on user-controlled data
- [ ] **L13.2** — Cookie serialization in `config/session.php` uses `encrypt` — not raw `serialize`
- [ ] **L13.3** — Queued job payloads do not use `unserialize()` on untrusted input

## L14 — Open Redirects
- [ ] **L14.1** — `redirect()->to($userInput)` not used with unvalidated URLs — use `redirect()->intended()` or allowlist
- [ ] **L14.2** — `redirect()->away()` only used with validated, trusted external URLs
- [ ] **L14.3** — Login `?redirect=` or `?intended=` parameters restricted to relative paths or same-origin URLs

## L15 — Queue & Job Security
- [ ] **L15.1** — Job class names not resolved from user input (prevents arbitrary class instantiation)
- [ ] **L15.2** — Queue payloads validated before processing — not blindly trusted
- [ ] **L15.3** — Failed job retry limits configured to prevent infinite loops

## L16 — Data Exposure
- [ ] **L16.1** — API responses use API Resources or `$hidden` — not raw `Model::all()` / `toArray()` with all fields
- [ ] **L16.2** — Sensitive fields (`password`, `remember_token`, `api_key`) listed in model `$hidden`
- [ ] **L16.3** — Pagination metadata does not leak total record counts when inappropriate

## L17 — Mail Header Injection
- [ ] **L17.1** — User input in email `to`, `cc`, `bcc` fields sanitised (no newline characters)
- [ ] **L17.2** — Email `subject` field does not allow header injection via newlines
- [ ] **L17.3** — Mailable recipients validated as proper email addresses before sending

## L18 — Artisan & Route Exposure
- [ ] **L18.1** — Laravel Telescope access restricted in production (auth gate or disabled entirely)
- [ ] **L18.2** — Laravel Horizon dashboard access restricted in production
- [ ] **L18.3** — Debug routes (`route:list` output, `php artisan` web endpoints) not accessible via web
- [ ] **L18.4** — `/storage` symlink does not expose sensitive files beyond intended public assets