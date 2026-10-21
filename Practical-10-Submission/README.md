# Practical 10: Asynchronous Processing with Event-Driven Architecture
## Advanced Web Development Frameworks (ITUE301)
### CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY

This directory (`AWDF/Practical-10-Submission/`) contains all submission materials, automated tests, Postman API collections, and evidence screenshots for Practical 10.

---

## 📁 Directory Structure

```text
Practical-10-Submission/
├── README.md                          # Quickstart, setup, and execution guide
├── LAB-REPORT.md                      # Academic lab report with theory & viva Q&A
├── IMPLEMENTATION.md                  # Technical architecture and event flow
├── screenshots/                       # 7 high-resolution evidence screenshots
│   ├── 01-project-structure.png
│   ├── 02-server-start.png
│   ├── 03-post-task-response.png
│   ├── 04-background-notification-logs.png
│   ├── 05-put-task-updated-event.png
│   ├── 06-notifications-logs-endpoint.png
│   └── 07-automated-tests.png
├── test-results/                      # Real execution logs
│   └── test-execution.log
├── docs/                              # Postman collection & environment template
│   ├── Practical_10_EventEmitter_API.postman_collection.json
│   └── Practical_10_Local.postman_environment.json
└── scripts/                           # Screenshot generation script
    └── generate_screenshots.py
```

---

## 🚀 Quickstart & Execution Guide

### 1. Prerequisites
- **Node.js** v18+ or v24+
- **MongoDB** running on `localhost:27017`

### 2. Run the Backend Server
```bash
cd task-manager-api
npm start
```

### 3. Run the Automated Test Suite (16/16 Passed)
```bash
cd task-manager-api
npm test
```
To run only Practical 10 tests:
```bash
npm run test:p10
```

### 4. Postman Collection Import
1. Open Postman.
2. Import `docs/Practical_10_EventEmitter_API.postman_collection.json`.
3. Import `docs/Practical_10_Local.postman_environment.json`.
4. Run requests in order:
   - `01. Auth - Register`
   - `02. Auth - Login` (captures `authToken`)
   - `03. Tasks - POST Create Task` (returns 201 Created immediately in ~28ms)
   - Observe server terminal output:
     `[Notification START] Task: ... | Assigned user: ... | Time: ...`
     `[Notification COMPLETE] Task: ... | Time: ... (2.0s later)`
   - `06. Events - GET Notification Logs` (inspects delivered notifications)

---

## 📊 Summary of Results
- **HTTP Client Latency:** ~28 ms (immediate non-blocking response)
- **Background Notification Time:** 2,000 ms simulated asynchronous processing
- **Test Results:** 16 tests passed across Practical 9 & 10 (0 failed)
