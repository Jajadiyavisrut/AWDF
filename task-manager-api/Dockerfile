# ===================================================
# Production Dockerfile for Node.js / Express Backend
# ===================================================
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# Install curl for container health check
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy all backend application source files
COPY . .

# Give the runtime user ownership of the CSV log file without making the app directory writable.
RUN touch log.csv && chown node:node log.csv

# Use non-root node user for container security hardening
USER node

# Expose backend API port
EXPOSE 5000

# Health check endpoint verification
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/debug/cache || exit 1

# Start the Express server
CMD ["node", "server.js"]
