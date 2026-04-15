# security-analysis-skill

A [GitHub Copilot skill](https://code.visualstudio.com/docs/copilot/customization/agent-skills) that performs comprehensive security audits of your codebase.

Covers the **OWASP Top 10 (2021)** with framework-specific checks for **Laravel**, **Next.js**, **ASP.NET Core C#**, **React**, and **GraphQL**.

## Install

Run one of these in your terminal — no global install needed:

```bash
npx security-analysis-skill
```

```bash
pnpm dlx security-analysis-skill
```

This copies the skill to `~/.agents/skills/security-analysis-skill/`, making it available in all your workspaces.

## Uninstall

```bash
npx security-analysis-skill --uninstall
```

## Usage

After installing, restart VS Code (or reload the Copilot Chat window), then:

1. Open a project you want to audit.
2. In Copilot Chat, type `/security-analysis-skill` or ask something like *"audit my code for security issues"*.
3. The skill produces a structured checklist report with ✅ PASS, ❌ FAIL, ⚠️ PARTIAL, or ➖ N/A for each check.

## What It Checks

| Category | Checks |
|---|---|
| Secrets & Configuration | Hardcoded secrets, `.env` in git, secrets management |
| Authentication & Sessions | Password hashing, session handling, JWT security |
| Authorisation | IDOR, privilege escalation, role-based access |
| Input Validation & Injection | SQLi, SSTI, command injection, file uploads |
| XSS | Output escaping, CSP, `dangerouslySetInnerHTML` |
| CSRF | Token validation, SameSite cookies |
| Security Headers | HSTS, X-Frame-Options, CSP, COOP, CORP |
| Cryptography | TLS enforcement, weak ciphers, encryption at rest |
| Dependencies | Known CVEs, lockfiles, abandoned packages |
| Error Handling & Logging | Stack trace exposure, sensitive data in logs |
| Rate Limiting & DoS | API rate limits, upload limits, ReDoS |
| SSRF | URL allowlists, private IP blocking |
| Open Redirects | Redirect validation, return URL restrictions |
| CORS | Wildcard origins, credential leaks |
| Deserialization | Unsafe deserializers, type discrimination |
| XXE | External entity resolution, DTD processing |
| Exposed Files | `.git/` access, backup files, debug pages |
| Deployment | Container security, debug ports, CI/CD secrets |

## License

MIT
