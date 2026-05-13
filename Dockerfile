### Multi-stage Dockerfile for production
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install build dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and prisma schema
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Generate prisma client and build TypeScript
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# Production image
FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --silent

# Copy built app and prisma artifacts from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3330

EXPOSE ${PORT}

# Healthcheck (lightweight): check /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

CMD ["node", "dist/server.js"]
