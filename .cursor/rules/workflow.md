Execution workflow:

- Always start by analyzing the request
- Break work into tasks
- Assign tasks to the correct agent
- **Surface delegation in the chat**: the orchestrator (or the active coordinator) must always expose a **delegation matrix** and the **next `@agent` message** to copy/paste
- Validate outputs before continuing

## Priority order

Planner → Orchestrator → Specialized agents (incl. `@ux` / `@marketing` / `@content` cuando el perfil lo requiera; perfil en `STACK.md` si está en el repo o en el mensaje) → Integration → Security Sentinel → Reviewer

## Operational rules

- **No agent** should perform tasks outside its strictly defined responsibility.
- **Visible handoffs:** If you are acting as `@orchestrator`, you **must** include the mandatory sections defined in `ai-team/orchestrator.md` (matrix, pipeline state, next message).
- **Security checkpoint:** Any code involving API routes, database queries, or user inputs MUST be validated by the Security Sentinel before the Reviewer signs off.
- **Final approval:** The Reviewer must confirm that the Sentinel's recommendations have been implemented (or explicitly waived with justification — rare).

## Single-chat reality (important)

Cursor does not spawn separate “subagent chat windows” for `@frontend` / `@backend` by default. **Delegation is enforced by prompts + your visible sections.** If the user wants strict isolation, they should send **one message per agent** using the “PRÓXIMO MENSAJE” block from the orchestrator.
