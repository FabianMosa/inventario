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
| `npm run test`       | Vitest en modo CI (`vitest run`) — reglas de stock (`lib/movements.js`) y demo (`lib/demo.js`) |
| `npm run test:watch` | Vitest en modo interactivo (desarrollo) |

## Funcionalidad

- Página de inicio orientada al visitante del portafolio: propuesta de valor, accesos rápidos a módulos, KPIs y alertas de stock mínimo.
- Categorías y ubicaciones (maestros).
- Artículos (SKU único, unidad, stock mínimo/máximo opcional).
- Saldos por artículo y ubicación.
- Movimientos: **entrada**, **salida**, **transferencia**, **ajuste** (cantidad positiva o negativa).
- Panel con alertas cuando el stock total está por debajo del mínimo.

## Estructura relevante

- `app/` — páginas y API Routes.
- `app/globals.css` — utilidades de UI (`.ui-card`, `.ui-input`, `.ui-btn-primary`, tablas) y fondo con malla (`bg-app-mesh`).
- `components/` — navegación, formularios y `PageHeader` para títulos consistentes.
- `tailwind.config.js` — tokens de marca (`brand`) y sombras personalizadas.
- `prisma/schema.prisma` — modelo de datos.
- `lib/prisma.js` — cliente Prisma singleton.
- `lib/movements.js` — lógica transaccional de inventario.
- `lib/demo.js` — flag `isDemoReadonly()` según `NEXT_PUBLIC_DEMO_READONLY`.
- `tests/` — pruebas Vitest (`npm run test`); ver `vitest.config.mjs`.

## Cursor y Engram (opcional)

Memoria MCP: `.cursor/mcp.json`. Protocolo de herramientas `mem_*` (búsqueda, guardado, cierre de sesión con `mem_session_summary`): **`.cursorrules/engram.md`**. Ver también `STACK.md` y `ai-team/planner.md` / `orchestrator.md`.

## Nota de seguridad

Al no haber login, cualquier visitante puede usar la API si el sitio es público. Úsalo solo como **portafolio** o protege el despliegue (por ejemplo, acceso restringido en Railway). Con **`NEXT_PUBLIC_DEMO_READONLY=true`** las rutas de escritura de la API responden **403** y la UI no permite enviar formularios (no sustituye un firewall; reduce cambios accidentales en la demo).
