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

# Build frontend
RUN pnpm run build

# Generate Prisma client
RUN pnpm exec prisma generate


# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache bash openssl

# Enable pnpm in runtime too
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy everything from base stage (includes node_modules + dist)
COPY --from=base /app ./

ENV NODE_ENV=production
ENV PORT=8080

# Ensure uploads directory exists
RUN mkdir -p /app/uploads/projects
RUN mkdir -p /app/uploads

EXPOSE 8080

# Use pnpm exec to call local tsx inside node_modules
CMD ["pnpm", "exec", "tsx", "bootstrap.ts"]
