# GraphQL Security Checklist

Framework-specific checks for GraphQL APIs (Apollo Server, GraphQL Yoga, Hot Chocolate, Lighthouse, etc.). Run after the universal checklist.

---

## GQL1 — Introspection
- [ ] **GQL1.1** — Introspection queries disabled in production (`introspection: false` or equivalent)
- [ ] **GQL1.2** — Schema not publicly accessible via SDL export endpoint in production
- [ ] **GQL1.3** — If introspection is needed (internal tools), access restricted to authenticated / internal users only

## GQL2 — Query Depth & Complexity Limiting
- [ ] **GQL2.1** — Maximum query depth configured and enforced (prevents deeply nested queries)
- [ ] **GQL2.2** — Query cost / complexity analysis implemented — expensive fields (relations, aggregations) assigned higher cost
- [ ] **GQL2.3** — Maximum complexity per query enforced; queries exceeding the limit are rejected before execution
- [ ] **GQL2.4** — Circular fragment references handled — parser rejects infinite recursion

## GQL3 — Batching Attacks
- [ ] **GQL3.1** — Query batching limited or disabled (prevents brute-force via batched login mutations)
- [ ] **GQL3.2** — If batching is allowed, a maximum batch size is enforced
- [ ] **GQL3.3** — Rate limiting applies per-query within a batch — not just per HTTP request

## GQL4 — Field-Level Authorization
- [ ] **GQL4.1** — Resolvers enforce authorisation per field — not just per query/mutation type
- [ ] **GQL4.2** — Sensitive fields (email, phone, SSN) require appropriate role/permission to resolve
- [ ] **GQL4.3** — Nested object resolvers re-check authorization — not inherited from parent resolver
- [ ] **GQL4.4** — Mutations validate user permissions before modifying data — not just read-level auth

## GQL5 — Input Validation
- [ ] **GQL5.1** — Mutation inputs validated beyond GraphQL schema types (e.g. string length, format, range)
- [ ] **GQL5.2** — Custom scalars used for constrained types (Email, URL, DateTime) — not raw `String`
- [ ] **GQL5.3** — List/array inputs have maximum size limits to prevent abuse
- [ ] **GQL5.4** — File uploads (if supported) validated for type, size, and content — same as REST upload rules

## GQL6 — Error Masking
- [ ] **GQL6.1** — Detailed resolver errors (stack traces, database errors, internal paths) not exposed to clients in production
- [ ] **GQL6.2** — Error formatting middleware strips sensitive details and returns generic messages
- [ ] **GQL6.3** — Validation errors provide enough detail for the client without leaking schema internals
- [ ] **GQL6.4** — Error extensions do not include debug information in production

## GQL7 — Rate Limiting
- [ ] **GQL7.1** — Rate limiting configured per-query or per-complexity (not just per-HTTP-request, since one request can contain expensive queries)
- [ ] **GQL7.2** — Authentication-related mutations (login, register, password reset) have stricter rate limits
- [ ] **GQL7.3** — Subscription connections rate-limited to prevent WebSocket abuse

## GQL8 — Persisted Queries
- [ ] **GQL8.1** — If supported, only persisted/approved queries allowed in production (prevents arbitrary query execution)
- [ ] **GQL8.2** — Automatic Persisted Queries (APQ) cache validated — not poisonable by attackers
- [ ] **GQL8.3** — If APQ is disabled, query allowlist enforced as an alternative