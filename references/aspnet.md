# ASP.NET Core (C#) API Security Checklist

Framework-specific checks for ASP.NET Core Web APIs. Run after the universal checklist.

---

## CS1 — Authentication & JWT
- [ ] **CS1.1** — JWT signing key is a strong secret (≥256-bit) stored in environment/secrets — not hardcoded in `appsettings.json`
- [ ] **CS1.2** — `ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ValidateIssuerSigningKey` all set to `true`
- [ ] **CS1.3** — Token expiry is short (≤1 hour for access tokens); refresh token rotation implemented
- [ ] **CS1.4** — Refresh tokens stored hashed in the database — not plaintext
- [ ] **CS1.5** — Revoked/invalidated tokens rejected (check token blacklist or short expiry strategy)

## CS2 — Authorisation
- [ ] **CS2.1** — `[Authorize]` attribute applied to all controllers/actions that require auth — not relying on middleware order alone
- [ ] **CS2.2** — `[AllowAnonymous]` only on intentionally public endpoints — audited for misuse
- [ ] **CS2.3** — Role-based (`[Authorize(Roles = "Admin")]`) or policy-based authorisation used — not manual role checks scattered in business logic
- [ ] **CS2.4** — `ResourceBasedAuthorization` or equivalent used where the user must own the resource
- [ ] **CS2.5** — No IDOR: entity queries always scoped to the authenticated user's tenant/ID

## CS3 — Input Validation
- [ ] **CS3.1** — Data annotations or FluentValidation on all request DTOs
- [ ] **CS3.2** — `[ApiController]` attribute used (enables automatic model validation + 400 response)
- [ ] **CS3.3** — Validation applied before business logic — not after
- [ ] **CS3.4** — No `[FromBody]` mapped directly to domain/entity models (use DTOs to prevent mass assignment)
- [ ] **CS3.5** — File upload endpoints validate content type via `IFormFile.ContentType` and magic bytes — not just extension

## CS4 — SQL Injection
- [ ] **CS4.1** — Entity Framework Core or Dapper with parameterised queries used throughout
- [ ] **CS4.2** — No raw SQL via `FromSqlRaw` or `ExecuteSqlRaw` with string interpolation — use `FromSqlInterpolated` or explicit parameters
- [ ] **CS4.3** — Stored procedures do not concatenate user input internally

## CS5 — Configuration & Secrets
- [ ] **CS5.1** — No secrets in `appsettings.json` or `appsettings.Development.json` committed to source control
- [ ] **CS5.2** — Production secrets loaded from environment variables, Azure Key Vault, AWS Secrets Manager, or equivalent
- [ ] **CS5.3** — `appsettings.Production.json` has no sensitive values — only non-sensitive overrides
- [ ] **CS5.4** — `app.UseDeveloperExceptionPage()` not active in production (only in `IsDevelopment()` block)
- [ ] **CS5.5** — Swagger/OpenAPI UI disabled or access-restricted in production

## CS6 — CORS
- [ ] **CS6.1** — CORS policy is explicit — not `AllowAnyOrigin()` on endpoints requiring auth
- [ ] **CS6.2** — `AllowCredentials()` not combined with `AllowAnyOrigin()` (runtime exception and security risk)
- [ ] **CS6.3** — Allowed origins list reviewed and matches actual frontend domains

## CS7 — Error Handling
- [ ] **CS7.1** — Global exception handler configured (`app.UseExceptionHandler("/error")` or middleware)
- [ ] **CS7.2** — Exception details not returned to clients in production (generic error messages only)
- [ ] **CS7.3** — `ProblemDetails` used for consistent, safe error responses
- [ ] **CS7.4** — Stack traces not logged at `Information` level — use `Error`/`Critical` with structured logging

## CS8 — Security Headers & HTTPS
- [ ] **CS8.1** — `app.UseHttpsRedirection()` enabled
- [ ] **CS8.2** — `app.UseHsts()` enabled in production
- [ ] **CS8.3** — Security headers added (CSP, X-Frame-Options, X-Content-Type-Options) — via middleware or reverse proxy
- [ ] **CS8.4** — `app.UseRouting()` → `app.UseAuthentication()` → `app.UseAuthorization()` in correct order in `Program.cs`

## CS9 — Rate Limiting & DoS
- [ ] **CS9.1** — ASP.NET Core Rate Limiting middleware (`AddRateLimiter`) configured on sensitive endpoints
- [ ] **CS9.2** — Request body size limit configured (`MaxRequestBodySize`) — not unlimited
- [ ] **CS9.3** — Timeout policies set on outbound HTTP calls (`HttpClient` with `Timeout`)
- [ ] **CS9.4** — Pagination enforced on all list/search endpoints

## CS10 — Logging
- [ ] **CS10.1** — Serilog or Microsoft.Extensions.Logging configured with structured logging
- [ ] **CS10.2** — No passwords, tokens, or PII in log messages
- [ ] **CS10.3** — Log level appropriate for production (not `Debug`/`Trace` globally)
- [ ] **CS10.4** — Correlation IDs logged on every request for traceability

## CS11 — Dependency Injection & Lifetime
- [ ] **CS11.1** — Services registered with appropriate lifetime (avoid `Singleton` for services with `DbContext` dependency)
- [ ] **CS11.2** — `DbContext` registered as `Scoped` — not `Singleton`
- [ ] **CS11.3** — No service locator antipattern (`IServiceProvider.GetService()` in business logic)

## CS12 — NuGet Dependencies
- [ ] **CS12.1** — `dotnet list package --vulnerable` run; no known CVEs
- [ ] **CS12.2** — `packages.lock.json` committed (NuGet lock file)
- [ ] **CS12.3** — Unused packages removed from `.csproj`

## CS13 — Insecure Deserialization
- [ ] **CS13.1** — No `BinaryFormatter` usage anywhere in the codebase (known RCE vector, obsoleted in .NET 8+)
- [ ] **CS13.2** — `Newtonsoft.Json` `TypeNameHandling` not set to `All`, `Auto`, or `Objects` with untrusted input
- [ ] **CS13.3** — `System.Text.Json` polymorphic deserialization uses `[JsonDerivedType]` with an explicit allowlist — not open-ended

## CS14 — Open Redirects
- [ ] **CS14.1** — `Redirect()` with user input replaced by `LocalRedirect()` or validated against an allowlist
- [ ] **CS14.2** — `ReturnUrl` / `returnUrl` query parameters validated with `Url.IsLocalUrl()` before redirecting
- [ ] **CS14.3** — OAuth/OpenID `redirect_uri` strictly validated against registered URIs

## CS15 — XXE (XML External Entities)
- [ ] **CS15.1** — `XmlReaderSettings.DtdProcessing` set to `Prohibit` (not `Parse`)
- [ ] **CS15.2** — `XDocument` / `XmlDocument` not used with default settings on untrusted XML input
- [ ] **CS15.3** — If XML input is accepted, external entity resolution explicitly disabled

## CS16 — Health Check Endpoints
- [ ] **CS16.1** — `/health` or `/healthz` endpoints do not expose internal service names, connection strings, or dependency versions to unauthenticated users
- [ ] **CS16.2** — Detailed health check data (`UIResponseWriter`) restricted to authenticated / internal requests
- [ ] **CS16.3** — Liveness vs. readiness probes separated — readiness probe does not expose excessive detail

## CS17 — SignalR Hub Authorization
- [ ] **CS17.1** — If SignalR is used, hub classes have `[Authorize]` attribute — not open by default
- [ ] **CS17.2** — Hub methods that perform privileged actions have additional role/policy checks
- [ ] **CS17.3** — SignalR connection tokens validated — not bypassed via direct WebSocket URL

## CS18 — Anti-Forgery (MVC / Razor)
- [ ] **CS18.1** — If the API also serves Razor views, `[ValidateAntiForgeryToken]` applied to all POST actions
- [ ] **CS18.2** — `@Html.AntiForgeryToken()` included in all Razor forms
- [ ] **CS18.3** — Auto anti-forgery validation enabled globally via `options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute())`