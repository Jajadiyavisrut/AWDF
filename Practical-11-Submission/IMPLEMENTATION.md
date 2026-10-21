# Technical Implementation Guide: Containerizing Full-Stack Task Manager

**University:** CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY (CHARUSAT)  
**Course:** Advanced Web Development Frameworks (ITUE301) — Sem 5  
**Practical 11:** Containerization with Docker and Docker Compose  

---

## 1. Frontend Dockerization ([`Dockerfile`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/Dockerfile))

Multi-stage build pattern:
- **Build Stage (`node:20-alpine`):** Installs dependencies using `npm ci`, sets `VITE_API_URL`, and compiles the JSX application into `/app/dist`.
- **Production Stage (`nginx:1.27-alpine`):** Copies `/app/dist` into `/usr/share/nginx/html` and deploys custom [`nginx.conf`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/nginx.conf).

### Nginx SPA Routing Configuration
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 2. Backend Dockerization ([`task-manager-api/Dockerfile`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/task-manager-api/Dockerfile))

- **Base Image:** `node:20-alpine`
- **Security Hardening:** Sets `USER node` to prevent running as root.
- **Production Optimization:** Uses `npm ci --omit=dev`.
- **Healthcheck:**
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/debug/cache || exit 1
  ```

---

## 3. Docker Compose Orchestration ([`docker-compose.yml`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/docker-compose.yml))

Orchestrates 3 microservices:
1. `mongodb` on port 27017 with healthcheck `mongosh --eval "db.adminCommand('ping')"`.
2. `backend` on port 5000 with `depends_on: { mongodb: { condition: service_healthy } }`.
3. `frontend` on port 80 with `depends_on: { backend: { condition: service_healthy } }`.

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: awdf-mongodb
    ports: ["27017:27017"]
    volumes: [mongodb_data:/data/db]
    networks: [awdf-network]

  backend:
    build: ./task-manager-api
    container_name: awdf-backend
    ports: ["5000:5000"]
    environment:
      - MONGO_URI=mongodb://mongodb:27017/p7
    depends_on:
      mongodb: { condition: service_healthy }
    networks: [awdf-network]

  frontend:
    build: .
    container_name: awdf-frontend
    ports: ["80:80"]
    depends_on:
      backend: { condition: service_healthy }
    networks: [awdf-network]

volumes:
  mongodb_data:
    name: awdf_mongodb_data
networks:
  awdf-network:
    name: awdf-network
```
