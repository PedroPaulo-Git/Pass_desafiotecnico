# Backend Dockerfile - Production
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
COPY pass_backend/package*.json ./
COPY --from=schemas /pass_schemas /pass_schemas
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=schemas /pass_schemas /pass_schemas
COPY pass_backend/package*.json ./
COPY pass_backend/tsconfig.json ./
COPY pass_backend/prisma ./prisma
COPY pass_backend/src ./src

RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=schemas /pass_schemas /pass_schemas

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
