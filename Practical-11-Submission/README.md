# Practical 11: Containerization with Docker and Docker Compose
## Advanced Web Development Frameworks (ITUE301)
### CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY

This directory (`AWDF/Practical-11-Submission/`) contains all submission deliverables, Docker architecture specifications, automated test evidence, Postman collections, and evidence screenshots for Practical 11.

---

## 📁 Directory Structure

```text
Practical-11-Submission/
├── README.md                          # Quickstart, setup, and orchestration guide
├── LAB-REPORT.md                      # Comprehensive academic lab report & viva Q&A
├── IMPLEMENTATION.md                  # Implementation details & Dockerfile explanations
├── DOCKER-ARCHITECTURE.md             # Multi-container network topology & Mermaid diagrams
├── screenshots/                       # 8 high-resolution evidence screenshots
│   ├── 01-docker-project-structure.png
│   ├── 02-frontend-dockerfile.png
│   ├── 03-backend-dockerfile.png
│   ├── 04-docker-compose-spec.png
│   ├── 05-docker-compose-up.png
│   ├── 06-healthchecks-and-dns.png
│   ├── 07-automated-tests-pass.png
│   └── 08-postman-api-verification.png
├── test-results/                      # Automated test suite execution logs
│   └── test-execution.log
├── docs/                              # Postman collection & environment template
│   ├── Practical_11_Docker_API.postman_collection.json
│   └── Practical_11_Docker.postman_environment.json
└── scripts/                           # Screenshot generation script
    └── generate_screenshots.py
```

---

## 🚀 Docker Compose Quickstart Guide

### 1. Prerequisites
- Install **Docker Desktop** (Windows/macOS) or **Docker Engine** + **Docker Compose** (Linux).
- Ensure Docker daemon is running:
  ```bash
  docker --version
  docker compose version
  ```

---

### 2. Build and Launch the Multi-Container Stack
From the project root (`AWDF/`):
```bash
docker compose up -d --build
```

Docker Compose orchestrates the three containers in sequence:
1. `awdf-mongodb`: Initializes on port 27017 and verifies storage health.
2. `awdf-backend`: Builds Node 20-alpine image, waits for MongoDB healthcheck, binds to port 5000.
3. `awdf-frontend`: Multi-stage compiles React bundle and serves via Nginx on port 80.

---

### 3. Verify Container Status
Check running services:
```bash
docker compose ps
```
Expected output:
```text
NAME             IMAGE              STATUS                    PORTS
awdf-mongodb     mongo:7.0          Up (healthy)              0.0.0.0:27017->27017/tcp
awdf-backend     awdf-backend:prod  Up (healthy)              0.0.0.0:5000->5000/tcp
awdf-frontend    awdf-frontend:prod Up                        0.0.0.0:80->80/tcp
```

---

### 4. Access the Applications
- **React Frontend:** Open `http://localhost` (or `http://localhost:80`) in your browser.
- **Backend API:** Access `http://localhost:5000/tasks`.
- **Backend Healthcheck:** Access `http://localhost:5000/debug/cache`.
- **Notification Telemetry:** Access `http://localhost:5000/notifications/logs`.

---

### 5. Inspect Service Logs
```bash
# View aggregated logs
docker compose logs -f

# View backend specific logs
docker compose logs -f backend
```

---

### 6. Stop and Clean Up
To stop the services while preserving MongoDB data:
```bash
docker compose down
```

To stop services and completely wipe persistent volume data:
```bash
docker compose down -v
```

---

## 🧪 Testing the Stack
Import the Postman collection located at:
- [`docs/Practical_11_Docker_API.postman_collection.json`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/Practical-11-Submission/docs/Practical_11_Docker_API.postman_collection.json)
- [`docs/Practical_11_Docker.postman_environment.json`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/Practical-11-Submission/docs/Practical_11_Docker.postman_environment.json)

Execute requests in order to verify authentication, task creation, cache invalidation, and background notification dispatches inside Docker.
