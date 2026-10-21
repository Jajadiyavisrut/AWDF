# ===================================================
# Stage 1: Build the React Application using Vite
# ===================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first for optimal Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies strictly matching the lockfile
RUN npm ci

# Copy full frontend source code
COPY . .

# Pass API URL build argument (defaults to local backend at port 5000)
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle into /app/dist
RUN npm run build

# ===================================================
# Stage 2: Serve Production Assets with Nginx Alpine
# ===================================================
FROM nginx:1.27-alpine AS production

# Remove default Nginx website configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration supporting SPA client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled production artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
