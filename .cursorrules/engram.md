# Engram — memoria persistente (MCP)

Documentación oficial del producto: [Engram — Cursor Setup](https://www.mintlify.com/Gentleman-Programming/engram/agents/cursor) y [Memory Protocol](https://www.mintlify.com/Gentleman-Programming/engram/concepts/memory-protocol).

## Configuración en este repo

- **MCP:** `.cursor/mcp.json` — servidor `engram` con `command: "engram"` y `args: ["mcp"]`.
- **Prerrequisito:** el binario `engram` instalado y en el **PATH** (Windows: `where engram`; macOS/Linux: `which engram`). Instalación típica: Homebrew `gentleman-programming/tap/engram` o [binary download](https://www.mintlify.com/Gentleman-Programming/engram/installation).

## Disponibilidad

Si el **servidor MCP Engram no está habilitado** o las herramientas no aparecen en Cursor, **no** intentes llamar `mem_*`. Continúa el flujo del AI Dev Team sin bloquear por memoria.

---

## Herramientas relevantes (referencia)

Además de `mem_search` y `mem_save`, el protocolo actual usa:

| Herramienta | Uso breve |
|-------------|-----------|
| `mem_context` | Contexto reciente de sesión (rápido; llamar antes que búsqueda amplia cuando el usuario pide “recordar” / recall). |
| `mem_search` | Búsqueda full-text (FTS) por palabras clave, tipo, alcance. |
| `mem_get_observation` | Contenido completo de una observación cuando el listado viene truncado. |
| `mem_save` | Guardar decisión, bugfix, descubrimiento, patrón (con formato estructurado). |
| `mem_session_summary` | **Obligatorio** antes de cerrar sesión o decir “listo” / “done” (ver formato abajo). |
| `mem_suggest_topic_key` | Sugerir `topic_key` estable para temas que evolucionan. |
| `mem_update` | Corregir una observación por **ID** (corrección, sin incrementar revisión como evolución). |

---

## Cuándo guardar (`mem_save`) — obligatorio tras hitos

Llamar **en cuanto** termine algo significativo:

- Bug corregido (qué fallaba, por qué, cómo se arregló, gotchas).
- Decisión de arquitectura o diseño (alternativas, trade-offs).
- Descubrimiento no obvio del código o del entorno.
- Cambio de configuración (env, MCP, scripts, despliegue).
- Patrón o convención acordada (nombres, estructura de carpetas).
- Preferencia explícita del usuario (estilo, idioma UI, stack).

### Formato recomendado del `content`

- **What:** una frase — qué se hizo.
- **Why:** motivación (petición, bug, rendimiento, deuda).
- **Where:** rutas de archivos y qué cambió en cada una.
- **Learned:** gotchas u omisiones si no hay nada relevante.

Metadatos útiles en `mem_save`:

- **title:** corto y buscable (estilo mensaje de commit).
- **type:** p. ej. `bugfix`, `decision`, `discovery`, `pattern`, `config`, `preference`, `architecture`.
- **scope:** `project` (por defecto, equipo/repo) o `personal`.
- **topic_key:** clave estable para el **mismo** tema que evoluciona (p. ej. `architecture/auth-model`). Temas distintos no deben reutilizar la misma key.

Contenido sensible: usar tags `<private>…</private>` en el texto para redacción antes de guardar (ver documentación Engram).

---

## Cuándo buscar memoria

### Reactivo (el usuario pide recordar)

Si dice “recuerda”, “recordar”, “qué hicimos”, “cómo lo resolvimos”, “recall”, etc.:

1. `mem_context` (historial reciente).
2. Si no basta, `mem_search` con keywords.
3. Si hace falta el cuerpo completo, `mem_get_observation` con el id.

### Proactivo (antes de trabajar)

Antes de diseñar features, decidir arquitectura o repetir un patrón: `mem_search` para no reinventar soluciones ya documentadas en el proyecto.

### AI Dev Team (alineación con `ai-team/*.md`)

- **`@planner`:** antes de planificar, `mem_search` si Engram está disponible; si no, omitir.
- **`@orchestrator`:** es el **escritor principal** de memoria al cerrar flujos; tras decisiones de arquitectura o resultados consolidados, `mem_save` cuando aporte valor (no spam).
- **Ejecutores** (`@frontend`, `@backend`, …): prioridad en ejecutar; usar memoria si el orquestador o el contexto ya la inyectó.

---

## Cierre de sesión — obligatorio: `mem_session_summary`

Antes de dar por terminada la sesión (o mensajes tipo “listo”, “eso es todo”, “done”):

1. Llamar `mem_session_summary` con un resumen que incluya como mínimo:

```markdown
## Goal
[En qué se trabajó esta sesión]

## Instructions
[Preferencias o restricciones del usuario descubiertas en la sesión, si las hay]

## Discoveries
- [Hallazgos técnicos o no obvios]

## Accomplished
- [Qué se completó, con detalle útil, no solo “arreglado”]

## Next Steps
- [Pendientes para la próxima sesión]

## Relevant Files
- ruta/archivo — [qué hace o qué cambió]
```

Sin este paso, la siguiente sesión arranca sin continuidad explícita en Engram.

---

## Tras compactación / reset de contexto

Si aparece aviso de compactación o “FIRST ACTION REQUIRED”:

1. Persistir con `mem_session_summary` el trabajo previo a la compactación.
2. Recuperar con `mem_context`.
3. Continuar con la petición del usuario.

---

## Reglas de calidad

- No guardar ruido trivial ni duplicar observaciones sin aportar.
- Priorizar **calidad** sobre cantidad.
- Títulos claros y técnicos.
- Varios agentes con el mismo insight → **consolidar** en una memoria de alto nivel cuando corresponda.
- Si `mem_search` devuelve un patrón relevante, **reutilizarlo** en lugar de reinventar.

## Key learnings (captura pasiva opcional)

Al final de una respuesta puedes añadir sección `## Key Learnings:` con viñetas; Engram puede extraer aprendizajes. Sigue siendo preferible `mem_save` explícito para decisiones críticas.
