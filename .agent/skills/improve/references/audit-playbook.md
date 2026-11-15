# Audit Playbook — Codebase Inspection Guidelines

This guide details the evaluation vectors, inspection tactics, and evidence requirements across the 9 audit tracks.

---

## The Prime Rule of Findings

> **A finding is only a finding with evidence.**
> *"Probably has N+1 queries somewhere"* is an unverified assumption.
> `src/orders/service.ts:142` querying order line items inside a `forEach` loop is an evidence-backed finding.

Adapt inspection depth based on repository size:
- Small repositories (<5k LOC): Inspect entry points, data models, and API boundaries thoroughly.
- Medium repositories (5k-50k LOC): Focus on cross-cutting concerns, database queries, and external APIs.
- Large repositories (>50k LOC): Prioritize hot paths, recent git churn, and core domain services.

---

## The 9 Audit Tracks

### 1. Correctness & Bugs
Look for logical defects that cause silent corruption or crashes:
- Unhandled Promise rejections and empty `catch` blocks (`catch (e) {}`).
- Race conditions in state mutation, concurrent database writes without locking/transactions.
- Off-by-one errors in pagination, slice boundaries, or cursor tracking.
- Incomplete enum/type exhaustiveness checks in switch/if chains.
- Mutation of shared input objects instead of immutable clones.

### 2. Security (Defensive Maintenance Focus)
Identify systemic security vulnerabilities across application boundaries:
- **Input Contracts**: Missing request body or query parameter schemas at API ingress (e.g. raw `req.body` passed directly to storage or business logic).
- **Injection Vectors**: Dynamic string concatenation in SQL queries, Shell execution (`exec()`), or HTML rendering (XSS sinks).
- **Access Control & IDOR**: Database queries filtering by ID without scoping to tenant or authenticated `user_id` (`where: { id }` instead of `where: { id, userId }`).
- **Secret & Token Hygiene**: Hardcoded credentials, exposed sensitive values in logs or client-facing responses, missing `httpOnly`/`Secure` cookie flags.
- **Dependency Posture**: Real vulnerabilities identified via `npm audit` / `pip-audit` that are directly reachable in production runtime code.

*Rule: Present all findings as defensive code hardening and config remediation. Never provide exploit payloads.*

### 3. Performance & Resource Efficiency
Look for bottlenecks that degrade latency or exhaust system memory:
- **N+1 Database Queries**: Nested fetch calls or database hits inside iteration loops.
- **Unindexed Database Access**: Queries filtering or sorting on unindexed foreign keys or columns.
- **Memory Leaks**: Event listeners, intervals, or WebSocket subscriptions added without teardown.
- **Payload Bloat**: Endpoints returning complete entity trees when only 2 fields are needed.
- **Blocking Operations**: Synchronous file system or compute-heavy operations on the main event loop thread.

### 4. Test Coverage & Verifiability
Identify fragility in automated test suites:
- Business-critical pricing, billing, or authorization logic lacking test coverage.
- Brittle tests asserting exact string messages instead of semantics.
- Tests relying on external network dependencies instead of localized fixtures or mocks.
- Flaky tests containing arbitrary `sleep()` delays instead of deterministic polling or event listeners.

### 5. Technical Debt & Architecture
Look for structural degradation:
- God-files (>800 LOC) handling multiple disjoint responsibilities.
- Circular dependencies between modules or domain layers.
- Duplicated utility logic across multiple files rather than a shared, tested helper.
- Leaky abstractions (e.g. database entities exposed directly to client UI components).

### 6. Dependencies & Maintenance
Identify risks in project supply chain:
- Unmaintained or abandoned dependencies with zero recent commits.
- Duplicate packages providing identical functionality (e.g. both `axios` and `node-fetch`, or `moment` and `dayjs`).
- Major version upgrade lag on key frameworks (Next.js, React, Node runtime).

### 7. Developer Experience (DX) & Tooling
Look for frictions slowing down engineering throughput:
- Missing or failing `tsc --noEmit` / lint scripts in `package.json`.
- Missing environment variable template (`.env.example`).
- Fragile or slow setup instructions in `README.md`.
- Inconsistent code style causing large noisy git diffs.

### 8. Documentation
Inspect project documentation accuracy:
- Stale architecture descriptions that contradict current code.
- Undocumented API routes, request parameters, or error responses.
- Missing setup prerequisites (Docker, database migrations, seed data).

### 9. Direction & Strategic Next Steps
Identify high-leverage product or architectural additions:
- Obvious missing endpoints completing a CRUD lifecycle.
- Caching layers (Redis) where repeated read-heavy data is requested.
- Rate limiting on public unauthenticated endpoints.
- Observability and health-check endpoints for production monitoring.

---

## Finding Structure Standard

Format every finding using this markdown schema:

```markdown
### [#<ID>] <Concise Imperative Title>
- **Track**: Correctness | Security | Performance | Test Coverage | Tech Debt | Dependencies | DX | Documentation | Direction
- **Location**: `<filepath>:<line>`
- **Evidence**:
  \`\`\`<lang>
  // exact excerpt from current codebase
  \`\`\`
- **Impact**: <1-2 sentences on what fails, degrades, or poses risk>
- **Effort**: Small (<1 hr) | Medium (1-4 hrs) | Large (>4 hrs)
- **Confidence**: High | Medium
- **Suggested Resolution**: <1 sentence high-level fix approach>
```
