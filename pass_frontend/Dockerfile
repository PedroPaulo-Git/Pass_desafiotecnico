# Frontend Dockerfile - Production
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat

# Build schemas
FROM base AS schemas
WORKDIR /pass_schemas
COPY pass_schemas/package*.json ./
COPY pass_schemas/tsconfig.json ./
COPY pass_schemas/src ./src
RUN npm install && npm run build

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY pass_frontend/package*.json ./
COPY --from=schemas /pass_schemas /pass_schemas
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=schemas /pass_schemas /pass_schemas
COPY pass_frontend/package*.json ./
COPY pass_frontend/next.config.js ./
COPY pass_frontend/tailwind.config.ts ./
COPY pass_frontend/postcss.config.js ./
COPY pass_frontend/tsconfig.json ./
COPY pass_frontend/components.json ./
COPY pass_frontend/src ./src
COPY pass_frontend/public ./public

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=schemas /pass_schemas /pass_schemas

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
