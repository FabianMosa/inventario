All development must follow the AI Dev Team architecture.

## Mandatory pipeline

1. **Planner** defines the plan (`@planner`)
2. **Orchestrator** coordinates execution and **logs delegation in chat** (`@orchestrator`) — see `ai-team/orchestrator.md`
3. **Specialized agents** implement (`@ux`, `@marketing`, `@content`, `@frontend`, `@styling`, `@backend`, `@db-dev`, …) según **perfil activo** (`STACK.md` si existe en el repo; si no, lo indicado en el mensaje del usuario)
4. **Integration** merges outputs (`@integration`)
5. **Security Sentinel** audits security-sensitive changes (`@security-sentinel`)
6. **Reviewer** validates and improves (`@reviewer`)

## Non-negotiables

- Never skip planning for non-trivial work.
- Never jump straight to implementation without an orchestration step (matrix + next agent).
- Never skip the Security Sentinel for sensitive surfaces (APIs, DB, auth, user input).
