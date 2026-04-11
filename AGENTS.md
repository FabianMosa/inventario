# AGENTS.md — Guía para asistentes de código (inventario)

Este documento orienta a **agentes de IA** y a desarrolladores humanos que trabajan en el repo **inventario**. Léelo antes de implementar cambios grandes.

## Qué es este proyecto

- **Aplicación web** de inventario para **portafolio**: catálogo de artículos, categorías, ubicaciones, saldos por `(artículo, ubicación)` y movimientos (entrada, salida, transferencia, ajuste).
- **Sin autenticación**: la API y la UI son públicas si el deploy es público; no asumir usuarios ni sesiones.
- **Stack:** Next.js 15 (App Router), **JavaScript** (no TypeScript), Tailwind CSS, Prisma, **PostgreSQL**.

## Perfil y flujo de equipo IA

- Perfil activo del monorepo/plantilla: ver **`STACK.md`** (`next-tailwind` por defecto).
- Roles y formato de delegación: carpeta **`ai-team/`** (`planner.md`, `orchestrator.md`, especialistas).
- Reglas adicionales de Cursor: **`.cursor/rules/`**, skills en **`.cursor/skills/`**.

## Cómo ejecutar y verificar

1. `DATABASE_URL` en `.env` (ver `.env.example`). No commitear `.env`.
2. `npm install`
3. `npx prisma migrate deploy` (o `npm run db:migrate` en desarrollo iterativo)
4. `npm run db:seed` (datos demo opcional)
5. `npm run dev` — http://localhost:3000
6. Antes de un PR o entrega: `npm run lint` y `npm run build`

El layout usa **`export const dynamic = "force-dynamic"`** en `app/layout.js` para evitar prerender que ejecute Prisma sin base de datos en CI/build.

## Dónde está cada cosa

| Área | Ubicación |
|------|-----------|
| Páginas y layouts | `app/` — la inicio (`app/page.js`) combina mensaje para visitante/evaluador, mosaico de enlaces y datos en vivo |
| API REST | `app/api/**/route.js` |
| Cliente Prisma singleton | `lib/prisma.js` |
| Demo solo lectura (UI + API) | `lib/demo.js` (`NEXT_PUBLIC_DEMO_READONLY`), `rejectIfDemoReadonly()` en `lib/http.js` |
| Reglas transaccionales de stock | `lib/movements.js` — toda mutación de saldos por movimientos debe pasar por aquí dentro de `$transaction` |
| Esquema y migraciones | `prisma/schema.prisma`, `prisma/migrations/` |
| Seed demo | `prisma/seed.js` — maestros + artículos `SKU-DEMO-*`; al re-ejecutar borra y recrea movimientos/saldos solo de esos SKUs (lógica de stock duplicada y alineada con `lib/movements.js`) |
| Componentes React cliente/servidor | `components/` |

## Convenciones al tocar código

- **UI en español** (etiquetas, mensajes de error entendibles para el usuario final demo).
- **Comentarios** donde aporten contexto (por qué existe un patrón, no obviedades).
- **Responsive:** tablas con `ui-table-shell` / `overflow-x-auto`, navegación usable en móvil.
- **UI:** tipografía **Plus Jakarta Sans** (`app/layout.js` vía `next/font/google`); colores de acento en escala `brand` (`tailwind.config.js`); componentes reutilizables en `app/globals.css` (prefijo `ui-`). `Nav` es cliente (`usePathname`) para resaltar la ruta activa.
- **Cambios acotados** al requerimiento; no refactor masivos no solicitados.
- Tras cambios **arquitectónicos o de flujo** relevantes, actualizar **`README.md`** y este **`AGENTS.md`** si aplica.

## Base de datos e inventario

- PostgreSQL en producción típica (**Railway**): variable `DATABASE_URL`.
- **SKU** único por artículo. Eliminar artículo solo si **no** tiene líneas de movimiento (la API lo exige).
- Movimientos: tipos `IN`, `OUT`, `TRANSFER`, `ADJUST` (en ajuste, cantidad con signo; el resto cantidad &gt; 0). Validación en `app/api/movements/route.js` + invariantes en `lib/movements.js`.

## Seguridad (sin login)

- Cualquier visitante puede llamar a las rutas API si el sitio es público.
- Mantener **validación de entrada** en APIs, Prisma parametrizado (sin SQL crudo concatenado), límites razonables en strings.
- Si se añade auth más adelante, revisar con el flujo `@security-sentinel` descrito en `ai-team/`.

## Memoria MCP (Engram)

- Configuración: `.cursor/mcp.json`.
- Cuándo y cómo usar `mem_search`, `mem_save`, `mem_session_summary`, etc.: **`.cursorrules/engram.md`**.

## Documentación humana

- **`README.md`**: instalación, Railway, scripts, funcionalidad resumida.

Si algo de este archivo queda desfasado respecto al código, **actualízalo en el mismo cambio** que introduzca la discrepancia.
