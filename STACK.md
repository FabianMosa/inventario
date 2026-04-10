# Perfiles de proyecto (stack)

Este archivo define **perfiles de trabajo** para el flujo **AI Dev Team** de este repo. El `@planner` y el `@orchestrator` deben leerlo y ajustar tareas **sin mezclar stacks**.

## Qué es este repositorio (contexto)

- **Plantilla Cursor:** reglas (`.cursor/rules/`), skills (`.cursor/skills/`), agentes en `ai-team/*.md`, guía para agentes en **`AGENTS.md`** y comando slash `/build-feature` (ver `.cursor/commands/build-feature.md`).
- **Setup:** scripts Node en `package.json` → `npm run setup:cursor` / `setup:cursor:force` (`scripts/setup-cursor.cjs`).
- **MCP opcional:** memoria persistente **Engram** en `.cursor/mcp.json` (`engram mcp`). Protocolo de uso (cuándo guardar, buscar y cerrar sesión): **`.cursorrules/engram.md`** — alineado con la [documentación oficial del Memory Protocol](https://www.mintlify.com/Gentleman-Programming/engram/concepts/memory-protocol). En Windows, el binario `engram` debe estar en el PATH (`where engram`).
- **Importante:** aquí no vive obligatoriamente una app Next.js; el **perfil A** describe el stack **típico** cuando construyes una web con las skills incluidas (Next, JS, Tailwind).

---

## Perfil A — `next-tailwind` (por defecto para apps web con esta plantilla)

- **Stack objetivo al implementar:** Next.js, JavaScript, Tailwind CSS (skills bajo `.cursor/skills/frontend`, `styling`, `backend`, etc.).
- **Pipeline típico:** `@planner` → `@orchestrator` → especialistas (`@ux`, `@marketing`, `@content`, `@frontend`, `@styling`, `@backend`, `@db-dev`, … según el feature) → `@integration` (si aplica) → `@security-sentinel` (API/DB/auth/input de usuario) → `@reviewer`.
- **Cuándo:** aplicaciones web que quieras alinear con las convenciones de las skills del repo.

## Perfil B — `design-ux` (producto / diseño de experiencia)

- **Enfoque:** flujos, jerarquía, estados vacíos/error, accesibilidad, microcopy de UI.
- **Agentes típicos:** `@ux` antes o en paralelo con `@frontend`; `@content` para textos finales.
- **Cuándo:** proyectos donde el riesgo principal es **claridad y usabilidad**, no solo código.

## Perfil C — `content-marketing` (go-to-market y copy)

- **Enfoque:** estrategia de mensaje, posicionamiento, estructura de activos de marketing, SEO on-page (sin prometer rankings).
- **Agentes típicos:** `@marketing` → `@content` → `@reviewer` (calidad editorial); código mínimo o ninguno.
- **Cuándo:** landings, decks de copy, emails, campañas y páginas de conversión (como documentos en repo).
