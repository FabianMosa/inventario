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
6. Antes de un PR o entrega: `npm run test`, `npm run lint` y `npm run build`

El layout usa **`export const dynamic = "force-dynamic"`** en `app/layout.js` para evitar prerender que ejecute Prisma sin base de datos en CI/build.

## Dónde está cada cosa

| Área | Ubicación |
|------|-----------|
| Páginas y layouts | `app/` — la inicio (`app/page.js`) combina mensaje para visitante/evaluador, mosaico de enlaces y datos en vivo |
| Etiqueta imprimible | `app/items/[id]/label/page.js` — QR + datos del artículo con `@media print`; usa `NEXT_PUBLIC_BASE_URL` para el enlace absoluto del QR |
| API REST | `app/api/**/route.js` |
| Cliente Prisma singleton | `lib/prisma.js` |
| Demo solo lectura (UI + API) | `lib/demo.js` (`NEXT_PUBLIC_DEMO_READONLY`), `rejectIfDemoReadonly()` en `lib/http.js` |
| Validación de input de la API | `lib/validation.js` — `LIMITS` (caps de longitud), `clean_string`, `to_non_negative_int`, `to_optional_int`, `parse_take`, `clean_search_query`, `is_movement_type`, `parse_movement_lines`, `validation_error`. Las API Routes en `app/api/**` deben usar estos helpers en lugar de duplicar la normalización |
| Reglas transaccionales de stock | `lib/movements.js` — toda mutación de saldos por movimientos debe pasar por aquí dentro de `$transaction` |
| Esquema y migraciones | `prisma/schema.prisma`, `prisma/migrations/` (campos `Item.imageUrl` y `Item.barcode` añadidos en `20260511192903_add_image_barcode`) |
| Seed demo | `prisma/seed.js` — maestros + artículos `SKU-DEMO-*`; al re-ejecutar borra y recrea movimientos/saldos solo de esos SKUs (lógica de stock duplicada y alineada con `lib/movements.js`) |
| Componentes React cliente/servidor | `components/` — incluye `BarcodeScanner`, `CameraCapture`, `FloatingScanner`, `ItemSearch` (todos `"use client"`) y `SafeImage` (wrapper cliente para `<img onError>`) |
| Tests automatizados (Vitest, Node) | `tests/**/*.test.js` — lógica en `lib/` con mocks (p. ej. saldos en memoria); no requiere PostgreSQL |

## Convenciones al tocar código

- **UI en español** (etiquetas, mensajes de error entendibles para el usuario final demo).
- **Comentarios** donde aporten contexto (por qué existe un patrón, no obviedades).
- **JSDoc** encima de cada función/componente nuevo.
- **`snake_case`** para variables y funciones locales (no `camelCase`); las APIs de librerías externas que ya son `camelCase` se respetan.
- **Responsive:** tablas con `ui-table-shell` / `overflow-x-auto`, navegación usable en móvil.
- **UI:** tipografía **Plus Jakarta Sans** (`app/layout.js` vía `next/font/google`); colores de acento en escala `brand` (`tailwind.config.js`); componentes reutilizables en `app/globals.css` (prefijo `ui-`). `Nav` es cliente (`usePathname`) para resaltar la ruta activa.
- **React Server Components (App Router):** las páginas de `app/` son Server Components por defecto y **no pueden recibir event handlers** (`onClick`, `onError`, `onChange`, etc.) como props de elementos. Si necesitas `onError` en un `<img>` (URL externa que puede caer), usa `components/SafeImage.js`. Para cualquier otra interactividad (`onClick`, `useState`, `useEffect`, acceso a `window`, cámara, etc.), extrae un Client Component con `"use client"` en `components/`. Patrón de referencia: `BarcodeScanner`, `CameraCapture`, `FloatingScanner`, `ItemSearch`.
- **Cambios acotados** al requerimiento; no refactor masivos no solicitados.
- Tras cambios **arquitectónicos o de flujo** relevantes, actualizar **`README.md`** y este **`AGENTS.md`** si aplica.

## Base de datos e inventario

- PostgreSQL en producción típica (**Railway**): variable `DATABASE_URL`.
- **SKU** único por artículo. Eliminar artículo solo si **no** tiene líneas de movimiento (la API lo exige).
- Campos opcionales del artículo: `imageUrl` (URL pública o `data:image/...` desde cámara) y `barcode` (EAN/UPC/Code128/etc.). El buscador `/items?q=…` aplica `contains` case-insensitive sobre `name`, `sku` y `barcode`.
- Movimientos: tipos `IN`, `OUT`, `TRANSFER`, `ADJUST` (en ajuste, cantidad con signo; el resto cantidad &gt; 0). Validación en `app/api/movements/route.js` + invariantes en `lib/movements.js`.

## Seguridad (sin login)

- Cualquier visitante puede llamar a las rutas API si el sitio es público.
- **Validación de entrada centralizada** en `lib/validation.js`. Todo handler `POST`/`PATCH` debe envolver el parseo en `try { ... } catch (e) { if (e instanceof validation_error) return jsonError(e.message, e.code === "STRING_TOO_LONG" ? 413 : 400); throw e; }`. Eso convierte cualquier overflow de longitud en `413 Payload Too Large` con mensaje legible, en lugar de aceptar payloads gigantes silenciosamente.
- **Caps de longitud (`LIMITS`)** que importan para no convertir la base en un saco de basura ni dejar la API expuesta a DoS por payload: `name=200`, `sku=100`, `description=2000`, `unit=20`, `image_url=2_000_000` (admite data URL de cámara), `barcode=200`, `code=100`, `reference=200`, `notes=2000`, `query=200`, `lines=200`. Si necesitas ampliar un cap, hazlo en `lib/validation.js` (no inline en el route) para que el cambio quede cubierto por tests.
- Prisma parametrizado (sin SQL crudo concatenado); el buscador usa `contains` case-insensitive y `q` se recorta a `LIMITS.query`.
- Si se añade auth más adelante, revisar con el flujo `@security-sentinel` descrito en `ai-team/`.

## Memoria MCP (Engram)

- Configuración: `.cursor/mcp.json`.
- Cuándo y cómo usar `mem_search`, `mem_save`, `mem_session_summary`, etc.: **`.cursorrules/engram.md`**.

## Documentación humana

- **`README.md`**: instalación, Railway, scripts, funcionalidad resumida.

Si algo de este archivo queda desfasado respecto al código, **actualízalo en el mismo cambio** que introduzca la discrepancia.
