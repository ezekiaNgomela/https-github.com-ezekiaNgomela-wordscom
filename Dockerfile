# Phase 16 - Production Deployment (WordCom Core OS)
# Multi-stage build for Node.js + TypeScript runtime

# -----------------------------
# 1. BASE IMAGE
# -----------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies required for native builds
RUN apk add --no-cache python3 make g++

# -----------------------------
# 2. DEPENDENCY INSTALL
# -----------------------------
FROM base AS deps

COPY package*.json ./

RUN npm ci || npm install

# -----------------------------
# 3. BUILD STAGE
# -----------------------------
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript project (assumes tsconfig + build script)
RUN npm run build || npx tsc

# -----------------------------
# 4. RUNTIME STAGE
# -----------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm ci --omit=dev || npm install --production

EXPOSE 3000

CMD ["node", "dist/index.js"]
