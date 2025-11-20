# ---------- Base stage ----------
FROM node:20-alpine AS base
WORKDIR /app

# System deps
RUN apk add --no-cache python3 make g++ bash libc6-compat openssl

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

# Copy entire project
COPY . .

# Frontend build
RUN pnpm run build

# Generate Prisma client
RUN pnpm exec prisma generate


# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache bash openssl

# Copy built app
COPY --from=base /app ./

ENV NODE_ENV=production
ENV PORT=8080

# Ensure uploads directory exists (Fly volume will mount here)
RUN mkdir -p /app/uploads

EXPOSE 8080

# Run backend exactly like dev — via tsx bootstrap.ts
CMD ["pnpm", "run", "server"]
