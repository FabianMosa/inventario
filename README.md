# Inventario (demo portafolio)

Aplicación **Next.js 15** (App Router, JavaScript) + **Tailwind CSS** + **Prisma** + **PostgreSQL**. Pensada como **demo pública sin autenticación** para portafolio; despliegue recomendado en **Railway** con el plugin Postgres.

Para **agentes de IA** y convenciones del repo: **[AGENTS.md](./AGENTS.md)**.

## Requisitos

- Node.js 20+
- Base PostgreSQL (local o Railway)

## Configuración local

1. Copia variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y asigna `DATABASE_URL` a tu instancia PostgreSQL.

   Opcional: **`NEXT_PUBLIC_DEMO_READONLY`** (`true` / `1` = solo lectura: API de escritura bloqueada y formularios deshabilitados; recomendado en demos públicas). Para desarrollar con altas y cambios, usa `false` o elimina la variable y reinicia el servidor.

   Opcional: **`NEXT_PUBLIC_BASE_URL`** (p. ej. `https://inventario.tudominio.com`). La usa la etiqueta imprimible (`/items/[id]/label`) para generar el QR con el enlace absoluto al detalle. Si no está definida, se asume `http://localhost:3000`.

3. Instala dependencias y aplica el esquema:

   ```bash
   npm install
   npx prisma migrate deploy
   npm run db:seed
   ```

4. Arranca en desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Railway

1. Crea un servicio **PostgreSQL** y copia la URL de conexión.
2. Crea un servicio **Web** desde este repo; variable de entorno `DATABASE_URL` = URL del Postgres.
3. Comando de build sugerido: `npm run build` (ejecuta `prisma generate`).
4. Comando de inicio: `npm start`.
5. Tras el primer deploy, ejecuta migraciones en un **one-off** o añade un paso de release, por ejemplo:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

   (Puedes usar la consola de Railway o un script de `release` en `package.json` si lo prefieres.)

## Scripts npm

| Script               | Descripción                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Desarrollo con Turbopack                      |
| `npm run build`      | Producción (`prisma generate` + `next build`) |
| `npm start`          | Servidor producción                           |
| `npm run db:migrate` | `prisma migrate dev` (desarrollo)             |
| `npm run db:push`    | `prisma db push` (prototipos rápidos)         |
| `npm run db:seed`    | Datos demo (10 artículos, 4 ubicaciones, 8 movimientos; resetea solo SKUs `SKU-DEMO-*`) |
| `npm run test`       | Vitest en modo CI (`vitest run`) — cubre `lib/movements.js`, `lib/demo.js`, `lib/http.js` y `lib/validation.js` |
| `npm run test:watch` | Vitest en modo interactivo (desarrollo) |

## Funcionalidad

- Página de inicio orientada al visitante del portafolio: propuesta de valor, accesos rápidos a módulos, KPIs y alertas de stock mínimo.
- Categorías y ubicaciones (maestros).
- Artículos (SKU único, unidad, stock mínimo/máximo opcional, **foto** e **identificación por código de barras**).
- Saldos por artículo y ubicación.
- Movimientos: **entrada**, **salida**, **transferencia**, **ajuste** (cantidad positiva o negativa).
- Panel con alertas cuando el stock total está por debajo del mínimo.
- **Buscador** en la lista de artículos por nombre, SKU o código de barras.
- **Escáner de código de barras** desde la cámara (móvil/desktop) mediante `html5-qrcode`: soporta EAN, UPC, Code128, Code39, ITF, Codabar y QR. Hay un **botón flotante** disponible en cualquier página y un acceso integrado en el buscador.
- **Captura de foto** del artículo desde la cámara: la imagen se guarda como `data URL` en `Item.imageUrl` (sin almacenamiento externo).
- **Etiqueta imprimible** por artículo (`/items/[id]/label`) con QR enlazando al detalle, nombre, SKU y código de barras.

## Estructura relevante

- `app/` — páginas y API Routes.
- `app/items/[id]/label/page.js` — vista imprimible de etiqueta (CSS aislado, `@media print`).
- `app/globals.css` — utilidades de UI (`.ui-card`, `.ui-input`, `.ui-btn-primary`, tablas) y fondo con malla (`bg-app-mesh`).
- `components/` — navegación, formularios y `PageHeader` para títulos consistentes.
  - `BarcodeScanner.js` — modal de escaneo de códigos con cámara (`html5-qrcode`, carga dinámica).
  - `CameraCapture.js` — modal de captura de foto (`getUserMedia` + `<canvas>` → `data URL`).
  - `FloatingScanner.js` — botón flotante global con escáner que navega al artículo detectado.
  - `ItemSearch.js` — buscador + escáner integrado en la lista de artículos.
  - `SafeImage.js` — Client Component que envuelve `<img>` con `onError` para fallback silencioso (necesario porque en Server Components no se pueden pasar event handlers).
- `tailwind.config.js` — tokens de marca (`brand`) y sombras personalizadas.
- `prisma/schema.prisma` — modelo de datos.
- `lib/prisma.js` — cliente Prisma singleton.
- `lib/movements.js` — lógica transaccional de inventario.
- `lib/demo.js` — flag `isDemoReadonly()` según `NEXT_PUBLIC_DEMO_READONLY`.
- `lib/http.js` — `jsonError()` y `rejectIfDemoReadonly()` para respuestas de API.
- `lib/validation.js` — helpers de validación y caps de longitud que aplican todas las rutas `POST/PATCH` (`LIMITS`, `clean_string`, `to_non_negative_int`, `parse_movement_lines`, etc.). Protege contra DoS por payloads enormes en una API pública sin auth.
- `tests/` — pruebas Vitest (`npm run test`); ver `vitest.config.mjs`. Cubre `lib/movements.js` (reglas de stock), `lib/demo.js`, `lib/http.js` y `lib/validation.js`.

## Cursor y Engram (opcional)

Memoria MCP: `.cursor/mcp.json`. Protocolo de herramientas `mem_*` (búsqueda, guardado, cierre de sesión con `mem_session_summary`): **`.cursorrules/engram.md`**. Ver también `STACK.md` y `ai-team/planner.md` / `orchestrator.md`.

## Nota de seguridad

Al no haber login, cualquier visitante puede usar la API si el sitio es público. Úsalo solo como **portafolio** o protege el despliegue (por ejemplo, acceso restringido en Railway). Con **`NEXT_PUBLIC_DEMO_READONLY=true`** las rutas de escritura de la API responden **403** y la UI no permite enviar formularios (no sustituye un firewall; reduce cambios accidentales en la demo).

Para defenderse de payloads abusivos en una API pública sin auth, todos los endpoints `POST`/`PATCH` aplican **caps de longitud** sobre los campos textuales y un **máximo de líneas por movimiento** definidos en `lib/validation.js` (`LIMITS`). Si un input supera el cap, la API responde **413 Payload Too Large** con el motivo en `{ error }`.

### Vulnerabilidades de dependencias

`npm audit` (y por extensión Snyk / `app.snyk.io`) ha reportado avisos sobre `next@15.x`. A continuación, las dos olas y cómo se mitigan en este repo.

**1) Release coordinada de Vercel — mayo 2026 (High)**

El 6 de mayo de 2026 Vercel publicó 13 avisos de seguridad para Next.js, varios **High**:

- `CVE-2026-44574` / `GHSA-492v-c6pp-mqqv` — Middleware/Proxy bypass via dynamic route parameter injection (CVSS 8.1).
- `CVE-2026-44575` — Middleware Authorization Bypass en App Router via `.rsc` / segment-prefetch URLs (CVSS 7.5).
- `CVE-2026-45109` — Fix incompleto de `CVE-2026-44575` sobre `middleware.ts` con **Turbopack** (CVSS 7.5). **Aplica a este repo** porque usamos `next dev --turbopack`.
- `CVE-2026-44579` — DoS por agotamiento de conexiones en Cache Components (CVSS 7.5).
- `CVE-2026-23870` — DoS en React Server Components (CVSS 7.5), entre otros.

Todos los avisos afectan **Next.js 15.x ≤ 15.5.17** y están **parcheados en `15.5.18`** (rama 15.x, npm dist-tag `backport`) o `16.2.6` (rama 16.x, `latest`). Por eso este repo declara `"next": "^15.5.18"` y `"eslint-config-next": "^15.5.18"` como **piso** del rango: aunque el lockfile ya resuelva `15.5.18`, Snyk evalúa el rango declarado, y un piso bajo (`^15.2.4`) hace que marque la dependencia como vulnerable aunque `npm audit` esté limpio. Pinear el floor en la versión parcheada alinea ambas lecturas.

**2) Avisos previos (moderate, ya cubiertos por `overrides`)**

- **`GHSA-qx2v-qp2m-jg93` — PostCSS XSS via Unescaped `</style>`** (`postcss <8.5.10`, moderate, CWE-79). Llega a través del `postcss` *vendored* dentro de `next/node_modules/postcss@8.4.31`. Es un riesgo **solo en build-time** procesando CSS no confiable; en runtime no afecta a usuarios finales. El equipo de Vercel lo solucionó en canary (PR [#93288](https://github.com/vercel/next.js/pull/93288), incluido a partir de `next@16.3.0-canary.6`) y **no plan de backport a `15.x`** por considerarlo no explotable en producción.
- **`GHSA-jxxr-4gwj-5jf2` — `brace-expansion` DoS** (`5.0.0 <5.0.6`, moderate, CWE-400). Llega vía `@typescript-eslint/typescript-estree → minimatch@10`; es una dependencia de **lint**, no de runtime.

Mitigación aplicada en este repo en `package.json`:

```json
"overrides": {
  "postcss": "$postcss",
  "brace-expansion": "^5.0.6"
}
```

`$postcss` reusa el rango declarado en `devDependencies` (`postcss: ^8.5.10`) y lo propaga al `postcss` anidado dentro de `next`. Tras `npm install`, `npm audit` y `npm audit --omit=dev` reportan **0 vulnerabilidades**. **No usar `npm audit fix --force`**: degrada `next` a `9.3.3` y rompe la app.

**Cuándo migrar a `next@16.x`**

`16.2.6` es el `latest` actual y trae los mismos parches en una rama mayor. La migración requiere revisar breaking changes (especialmente `next lint` deprecado y APIs de App Router); fuera del alcance de este repo de portafolio salvo que el lockfile se vuelva a romper.
