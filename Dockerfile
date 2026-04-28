# Base: shared system dependencies for both dev and prod.
# =======================================================
FROM node:24-slim AS base

# Install Chromium and minimal runtime dependencies.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       chromium \
       fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Tell the app where Chromium lives.
ENV CHROMIUM_PATH=/usr/bin/chromium

# Set the working directory inside the container.
WORKDIR /app

# Development: full dependencies, source mounted at runtime.
# ==========================================================
FROM base AS dev

# Copy dependency manifests first for optimal layer caching.
COPY package.json package-lock.json .npmrc ./

# Install all dependencies (including devDependencies).
RUN npm ci

# Create logs directory owned by the non-root node user.
RUN mkdir -p logs && chown -R node:node /app

# Switch to the non-root user for better security.
USER node

# Start the application with the environment variables from the `.env` file.
CMD ["node", "--env-file=.env", "src/app.ts"]

# Production: lean image with source baked in.
# ============================================
FROM base AS prod

# Copy dependency manifests first for optimal layer caching.
COPY package.json package-lock.json .npmrc ./

# Install production dependencies only.
RUN npm ci --omit=dev

# Copy application source (except files ignored by `.dockerignore`).
COPY src/ src/

# Create logs directory owned by the non-root node user.
RUN mkdir -p logs && chown -R node:node /app

# Switch to the non-root user for better security.
USER node

# Start the application with the environment variables from the `.env` file.
CMD ["node", "--env-file=.env", "src/app.ts"]
