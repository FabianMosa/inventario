
# /build-feature

## Description

Inicia el flujo **AI Dev Team** para una feature nueva: plan → orquestación visible → agentes especializados.

## Usage

/build-feature [descripción]  
Opcional al inicio: `Perfil activo: next-tailwind` (u otro en `STACK.md`).

## Example

/build-feature Perfil activo: next-tailwind — panel de reservas con listado y detalle

## Proceso (alineado al repo)

1. `@planner` — plan con arquitectura y tareas; handoff al orquestador.
2. `@orchestrator` — **MATRIZ DE DELEGACIÓN** + **PRÓXIMO MENSAJE** (formato en `ai-team/orchestrator.md`).
3. Agentes en orden según matriz, por ejemplo:
   - `@marketing` / `@ux` / `@content` (perfiles `content-marketing` o `design-ux`)
   - `@db-dev` + skills bajo `.cursor/skills/database/`
   - `@backend` (rutas API / lógica servidor)
   - `@frontend` + `@styling` (UI + Tailwind responsive)
4. `@integration` si hay que unificar ramas de archivos.
5. `@security-sentinel` si hay API/DB/auth/input de usuario.
6. `@reviewer` — veredicto y acciones.

No uses nombres de agentes legacy; sigue `ai-team/*.md` y `.cursor/rules/roles.md`.
