FROM node:22-alpine AS base

# Dependencias base
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Instalar dependencias (copiamos prisma para que se pueda ejecutar el script postinstall)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Construir la app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Asegurar que el directorio public exista para la etapa runner
RUN mkdir -p /app/public

# Dummy DATABASE_URL para que prisma.config.mjs y next build validen en compilación sin base de datos real
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/inventario?schema=public"

# Generar cliente de Prisma y hacer el build de Next.js
# Se usa output: "standalone" en next.config.mjs para reducir el tamaño
RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Instalar openssl para que Prisma funcione
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar directorio publico y configuraciones de prisma para posibles comandos (migraciones)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.mjs ./prisma.config.mjs
COPY --from=builder /app/package.json ./package.json

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar el build standalone y los estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar a usuario sin privilegios
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js es generado por el output standalone de Next.js
CMD ["node", "server.js"]
