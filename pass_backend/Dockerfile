# Backend Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY pass_backend/package*.json ./pass_backend/
COPY pass_schemas ./pass_schemas/

# Install dependencies
WORKDIR /app/pass_backend
RUN npm ci

# Copy source code
COPY pass_backend .

# Build
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/pass_backend/dist ./dist
COPY --from=builder /app/pass_backend/package*.json ./
COPY --from=builder /app/pass_backend/node_modules ./node_modules

EXPOSE 3333

CMD ["npm", "run", "start:prod"]
