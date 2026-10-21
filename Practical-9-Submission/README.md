# Practical 9: In-Memory Caching and Query Optimization
## Advanced Web Development Frameworks (ITUE301)
### CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY

This directory (`AWDF/Practical-9-Submission/`) contains all practical submissions, empirical benchmark results, automated integration tests, Postman API collections, and evidence screenshots for Practical 9.

---

## 📁 Directory Structure

```text
Practical-9-Submission/
├── README.md                          # Quickstart, setup, and execution guide
├── LAB-REPORT.md                      # Comprehensive academic lab report
├── RESPONSE-TIME-RESULTS.md           # Empirical latency analysis & formulas
├── screenshots/                       # 12 high-resolution evidence screenshots
│   ├── 01-project-structure.png
│   ├── 02-node-cache-installation.png
│   ├── 03-server-start.png
│   ├── 04-get-tasks-first-request.png
│   ├── 05-get-tasks-repeated-request.png
│   ├── 06-post-task.png
│   ├── 07-put-task.png
│   ├── 08-delete-task.png
│   ├── 09-single-task-cache.png
│   ├── 10-cache-statistics.png
│   ├── 11-response-time-comparison.png
│   └── 12-automated-tests.png
├── test-results/                      # Raw benchmark JSON & terminal logs
│   ├── benchmark-results.json
│   ├── benchmark-execution.log
│   └── test-execution.log
├── docs/                              # Postman collection & environment template
│   ├── Practical_9_Cache_API.postman_collection.json
│   └── Practical_9_Local.postman_environment.json
└── scripts/                           # Reproducibility utilities
    ├── generate_screenshots.py
    └── run_practical9_suite.js
```

---

## 🚀 Quickstart & Execution Guide

### 1. Prerequisites
Ensure the following software is installed on your workstation:
- **Node.js** (v18.x, v20.x, or v24.x)
- **npm** (v9+ or v10+)
- **MongoDB** (Local Community Server running on `localhost:27017` or a MongoDB Atlas URI)
- **Python 3.x** (with Pillow library for screenshot regeneration)

---

### 2. Environment Configuration
Navigate to `task-manager-api` and verify `.env`:
```bash
cd task-manager-api
```
Create or verify `.env` (a safe template is provided in `.env.example`):
```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/p7
JWT_SECRET=your_super_secret_jwt_key_here
CACHE_TTL=60
CACHE_CHECK_PERIOD=120
FRONTEND_URL=http://localhost:5173
```

---

### 3. Installation
Install dependencies in `task-manager-api`:
```bash
cd task-manager-api
npm install
```

---

### 4. How to Start MongoDB
- **Windows (Service):**
  ```powershell
  Get-Service -Name "*mongo*"
  # If stopped:
  Start-Service -Name "MongoDB"
  ```
- **MongoDB Atlas:** Set `MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/p7?retryWrites=true&w=majority` in `.env`.

---

### 5. How to Start the Backend Server
From `task-manager-api/`:
```bash
npm start
```
Expected output:
```text
Task Manager Server running on port 5000
MongoDB connected successfully.
User-owned task collections are ready.
```

---

### 6. How to Run Automated Integration Tests
The project includes a 10-point automated integration test suite covering cache hits, misses, invalidations on POST/PUT/PATCH/DELETE, single-task caching, telemetry, empty arrays, and authorization boundaries:
```bash
cd task-manager-api
npm test
```
Expected output:
```text
▶ Practical 9: In-Memory Caching & Query Optimization Integration Suite
  ✔ Test 1: Empty Result Sets & Cache Handling (13.33ms)
  ✔ Test 2: Cache Invalidation after POST /tasks (12.81ms)
  ✔ Test 3: Repeated GET /tasks produces Cache HIT (3.98ms)
  ✔ Test 4: Single Task Cache (GET /tasks/:id) - MISS then HIT (8.02ms)
  ✔ Test 5: Cache Invalidation after PUT /tasks/:id (12.67ms)
  ✔ Test 6: Cache Invalidation after PATCH /tasks/:id (13.26ms)
  ✔ Test 7: Cache Invalidation after DELETE /tasks/:id (20.22ms)
  ✔ Test 8: Debug & Cache Telemetry Endpoints (/debug/cache & /cache/stats) (5.58ms)
  ✔ Test 9: Cross-User Data Isolation & Cache Privacy (21.37ms)
  ✔ Test 10: Authentication Enforcement & Protection (5.16ms)
✔ Practical 9: In-Memory Caching & Query Optimization Integration Suite (414.80ms)
ℹ pass 10
ℹ fail 0
```

---

### 7. How to Execute the Empirical Benchmark
Run the automated benchmark measuring uncached vs cached response latency with 15 seeded tasks:
```bash
cd task-manager-api
npm run benchmark
```
Output summary:
```text
================================================================
                EMPIRICAL PERFORMANCE SUMMARY
================================================================
| Metric              | Uncached (MongoDB) | Cached (node-cache) | Improvement |
|---------------------|--------------------|---------------------|-------------|
| Average Latency     | 3.028 ms           | 1.778 ms            | 41.28% fast |
| Median Latency      | 2.953 ms           | 1.480 ms            | 49.88% fast |
| Min Latency         | 2.596 ms           | 1.169 ms            | -           |
| Max Latency         | 3.635 ms           | 3.506 ms            | -           |
================================================================
Speedup Factor: 1.70x faster with in-memory caching!
```
Raw metrics are automatically exported to `Practical-9-Submission/test-results/benchmark-results.json`.

---

### 8. How to Start the Frontend
From the root `AWDF/` directory:
```bash
npm run dev
```
The React frontend opens at `http://localhost:5173`. Alternatively, run both frontend and backend together using:
```bash
python run_project.py
```

---

### 9. Postman Collection Import Guide
1. Launch Postman.
2. Click **Import** (top left).
3. Select file: `Practical-9-Submission/docs/Practical_9_Cache_API.postman_collection.json`.
4. Click **Import Environments** and select: `Practical-9-Submission/docs/Practical_9_Local.postman_environment.json`.
5. Select the **Practical 9 Local Environment** from the top right dropdown.
6. Execute requests in sequence:
   - **01. Auth - Register**
   - **02. Auth - Login** (automatically captures the `authToken` into the environment)
   - **03. Tasks - GET All Tasks** (1st call: `X-Cache: MISS`, 2nd call: `X-Cache: HIT`)
   - **04. Tasks - POST Create Task** (invalidates cache)
   - **05. Tasks - GET Single Task by ID** (single task caching)
   - **06. Tasks - PUT Update Task** (dual cache eviction)
   - **07. Tasks - PATCH Partial Update Task**
   - **08. Tasks - DELETE Task**
   - **09. Cache - GET Debug Statistics** (`/debug/cache`)

---

### 10. Accessing Cache Debug Telemetry
You can query the live cache statistics at any time via browser or cURL:
```bash
curl http://localhost:5000/debug/cache
```
Response:
```json
{
  "status": "online",
  "hits": 12,
  "misses": 4,
  "totalRequests": 16,
  "hitRatio": "75.0%",
  "ttlSeconds": 60,
  "cachedKeysCount": 2,
  "keys": [
    "tasks:6ad87158...:all",
    "task:6ad87158...:6ad87158ea4e..."
  ],
  "internalStats": {
    "hits": 12,
    "misses": 4,
    "keys": 2,
    "ksize": 68,
    "vsize": 1240
  }
}
```

To flush the cache manually:
```bash
curl -X POST http://localhost:5000/debug/cache/clear
```

---

## 🛠️ Common Troubleshooting Steps

| Issue | Resolution |
| :--- | :--- |
| **MongoDB connection error (`ECONNREFUSED 127.0.0.1:27017`)** | Ensure the MongoDB Windows service is running via `Start-Service MongoDB` or start `mongod` manually. |
| **Port 5000 already in use (`EADDRINUSE`)** | Find the PID using `Get-NetTCPConnection -LocalPort 5000` and stop the conflicting process with `Stop-Process -Id <PID>`. |
| **Stale tasks displayed in UI** | Ensure cache invalidation is active. You can clear the cache immediately by hitting `POST /debug/cache/clear`. |
| **JWT Unauthorized (401)** | The JWT token expires in 1 hour. Send a new `POST /login` request to acquire a fresh token. |
