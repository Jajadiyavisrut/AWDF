# AWDF - Advanced Web Development Frameworks (ITUE301)

**CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY**  
**FACULTY OF TECHNOLOGY AND ENGINEERING**  
**B. TECH (AIML / IT / CE / CSE)**

Student: **Visrut Jajadiya**

---

## Practical 4: Connecting React Frontend with Express Backend (To-Do List CRUD Integration)

### Objective
To connect the React frontend with the custom Express RESTful API backend, building a complete MERN integration for a Task Management system using asynchronous `fetch` requests (`GET`, `POST`, `PUT`, `DELETE`).

### Architecture & Endpoints Integrated
* **Frontend Component**: [`src/assets/components/TodoList.jsx`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/src/assets/components/TodoList.jsx)
* **Backend Host**: `http://localhost:5000/tasks`

| HTTP Method | API Path | Action | Status Code |
|---|---|---|---|
| `GET` | `/tasks` | Retrieves all tasks | `200 OK` |
| `POST` | `/tasks` | Creates a new task | `201 Created` |
| `PUT` | `/tasks/:id` | Toggles task completion state | `200 OK` |
| `DELETE` | `/tasks/:id` | Deletes a task by ID | `200 OK` |

### Key Features Implemented
1. **Full CRUD Loop**: React UI instantly triggers database changes on the Express server and reflects updates without page reloads.
2. **CORS Configuration**: Configured custom Access-Control headers inside [`server.js`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/task-manager-api/server.js) to allow cross-origin requests.
3. **Robust Error & Recovery States**: Displays dynamic loaders (`<Spinner />`) during API calls, a global connection error page (`<ErrorMessage />`) with a **Retry** button, and local operation error banners.

---

## Practical 3 (Backend): RESTful Express Backend

### Objective
To design and implement a RESTful backend server with complete CRUD endpoints using an Express middleware pipeline.

* **Server File**: [`task-manager-api/server.js`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/task-manager-api/server.js)
* **Logger Middleware**: [`task-manager-api/middleware/logger.js`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/task-manager-api/middleware/logger.js)
* **Header Validator Middleware**: Enforces `Content-Type: application/json` for `POST`/`PUT` requests.
* **ID Validator Middleware**: Validates task ID parameter as a positive integer.
* **Global Error Handler**: Catches system/internal errors and returns HTTP 500 cleanly.

---

## Practical 3 (Frontend): API Integration and Data Rendering in React

* Consumes public GitHub REST API: `https://api.github.com/users/Jajadiyavisrut/repos` on the Projects page.
* Dynamic loading spinner, error fallback, live search filtering by name, and pagination controls.

---

## Practical 2: State Management and Routing in React

* Client-side routing with `react-router-dom` v6 (`/`, `/projects`, `/contact`, `/todo`, `*`).
* Dark/Light Mode toggle using `useState` in `NavBar.jsx`.
* Controlled Contact Form with live character counter and UI tooltip visibility toggle.

---

### How to Run Locally

#### 1. Start Backend Server
```bash
cd task-manager-api
npm install
npm run dev
```

#### 2. Start Frontend Server
```bash
npm install
npm run dev
```

### Practical 7: Authentication and Middleware Pipeline

The task API now supports JWT authentication:

1. Copy `task-manager-api/.env.example` to `task-manager-api/.env`, keep `MONGO_URI` pointed at the `p7` database, and set a private `JWT_SECRET`.
2. Start MongoDB, then run `npm install` and `npm run dev` from `task-manager-api`.
3. Open the frontend and use `/login` to register or sign in.

Available auth endpoints:

* `POST /register` with `{ "email": "...", "password": "..." }`
* `POST /login` returns a JWT valid for one hour.
* `POST /forgot-password` with `{ "email": "..." }` sends a reset link when SMTP is configured.
* `POST /reset-password/:token` with `{ "password": "..." }` stores the new password.
* `GET /me` requires `Authorization: Bearer <token>`.

All application routes except `/login` and reset-password are protected. Every task belongs to the authenticated user, and task queries never return another user's tasks. New tasks always start as `pending`; status can only move forward from `pending` to `working` to `completed`, never backward. Tasks support these statuses in both the API and Todo UI. Registration and reset passwords must contain at least 8 characters, uppercase and lowercase letters, a number, and a special character. Task request bodies are validated before reaching Mongoose; missing or blank titles return `400`. The frontend stores the token locally, adds it to task requests, clears it on logout or `401`, and redirects to `/login` when the session expires.

Every response is logged to both MongoDB and `task-manager-api/log.csv`. Login, task creation, task updates, and task deletion send email notifications to the logged-in user's email. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, and `FRONTEND_URL` in the ignored `.env`; without SMTP configuration, the API keeps working and reports skipped email delivery in its console.

### Practical 8: Performance Optimization and Lazy Loading in React

#### Objective
To improve frontend performance, reduce initial bundle payload, and enhance perceived responsiveness using route-level code splitting, lazy loading (`React.lazy()` and `<Suspense>`), anti-flicker delay fallbacks, heavy third-party chunk isolation, and render profiling with `React.memo`.

#### Architecture Diagram

```
Before Optimization (Single Monolithic Bundle):
main.bundle.js (~1.2 MB with jsPDF) ──────────────────► [Home][Projects][Contact][TodoList][PDF Engine] all loaded upfront

After Optimization (Code-Split on Demand):
index.js (247.35 kB / 78.59 kB gzip) ──► Loads initially on first visit (Shell, Home, Auth)
Contact.chunk.js (3.30 kB)          ──► Loaded only when /contact is visited
Projects.chunk.js (5.62 kB)         ──► Loaded only when /projects is visited
TodoList.chunk.js (9.40 kB)         ──► Loaded only when /todo is visited
TaskReportModal + jsPDF (~810 kB)   ──► Loaded ONLY when user clicks "View Analytics & PDF Report"
```

#### Core Implementation Details

1. **Route-Based Code Splitting (`src/App.jsx`)**:
   - `Projects`, `Contact`, and `TodoList` routes are imported using `React.lazy()`:
     ```javascript
     const Projects = lazy(() => import('./assets/components/Projects'))
     const Contact = lazy(() => import('./assets/components/Contact'))
     const TodoList = lazy(() => import('./assets/components/TodoList'))
     ```
   - Wrapped inside `<Suspense>` with accessible `<PageLoader />` fallback displaying a spinner and status message (`role="status"`, `aria-live="polite"`).

2. **Supplementary Problem 1: Lazy Loading Heavy Third-Party Library (`jspdf`)**:
   - `jspdf`, `jspdf-autotable`, and canvas rendering engines total over **800 kB** of JavaScript.
   - Isolated completely into [`src/assets/components/TaskReportModal.jsx`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/src/assets/components/TaskReportModal.jsx), which is dynamically loaded on-demand only when clicking **"📊 View Analytics & PDF Report"** in `TodoList.jsx`.
   - Result: `TodoList.chunk.js` remains tiny (9.40 kB) instead of exceeding ~850 kB.

3. **Supplementary Problem 2: Minimum-Delay Fallback to Eliminate UI Flicker**:
   - On fast networks or cached local re-visits, chunks load in 10–30ms. Flashing a spinner for 20ms causes an annoying screen flicker.
   - Implemented [`src/assets/components/DelayedFallback.jsx`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/src/assets/components/DelayedFallback.jsx) with a 300ms deferral window:
     ```javascript
     <Suspense fallback={<DelayedFallback delay={300}><PageLoader /></DelayedFallback>}>
     ```
   - If the chunk resolves in under 300ms, the fallback spinner is suppressed entirely. On slower connections (>300ms, e.g. Slow 3G), the fallback displays smoothly without abrupt flashes.
   - Also provided `lazyWithMinDelay()` in [`src/assets/components/lazyUtils.js`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/src/assets/components/lazyUtils.js) for test environments.

4. **Supplementary Problem 3 & Post-Lab: Profiling & Fixing Unnecessary Re-renders**:
   - **Profiling Observation**: Using React DevTools Profiler, typing in the new task input field (`newTaskTitle`) triggered re-renders of the parent `TodoList` component and re-rendered every single child task item card on every keystroke.
   - **Root Cause**: Task cards were rendered inline without memoization; typing mutated parent input state.
   - **Solution**: Extracted and wrapped `TaskCard` with `React.memo` and memoized event handlers (`handleStatusChange`, `handleStartEdit`, `handleSaveEdit`, `handleCancelEdit`, `handleDeleteClick`) using `useCallback`.
   - **Result**: Typing in the input field now only updates the input bar; all `TaskCard` components skip rendering (Profiler displays grey "Did not render" bars).

#### Bundle Size Measurement Comparison (`npm run build`)

| Chunk Asset | File | Size | Gzip Size | When Downloaded |
|---|---|---:|---:|---|
| **Initial Bundle (Main Entry)** | `dist/assets/index-*.js` | 247.35 kB | 78.59 kB | Initial page visit (`/` or `/login`) |
| **Contact Route Chunk** | `dist/assets/Contact-*.js` | 3.30 kB | 1.16 kB | On visiting `/contact` |
| **Projects Route Chunk** | `dist/assets/Projects-*.js` | 5.62 kB | 2.03 kB | On visiting `/projects` |
| **TodoList Route Chunk** | `dist/assets/TodoList-*.js` | 9.40 kB | 3.28 kB | On visiting `/todo` |
| **Heavy Report Modal Chunk** | `dist/assets/TaskReportModal-*.js` | 435.65 kB | 140.98 kB | On clicking "View Analytics & PDF Report" |
| **Heavy jsPDF Engine Chunks** | `html2canvas-*.js` + `index.es-*.js` | 378.20 kB | 106.24 kB | On demand with PDF Report Modal |

*Total savings on initial download:* Over **830 kB** of code is deferred from initial page load!

#### Network Tab Profiling Steps (DevTools)

1. Open DevTools (`F12`) -> **Network** tab.
2. Check **Disable cache**.
3. In throttling dropdown, select **Slow 3G**.
4. Reload `http://localhost:5173/`. Notice only `index.html`, `index.css`, and `index-*.js` load initially.
5. Click **Projects** in navbar: observe that `Projects-*.js` is requested dynamically over the network, and `<DelayedFallback>` renders the spinner after 300ms until the chunk arrives.
6. Click **To-Do** in navbar: `TodoList-*.js` loads on demand.
7. Click **"📊 View Analytics & PDF Report"**: `TaskReportModal-*.js` and `jspdf` chunks load on demand, then generate and download the PDF seamlessly.

---

### Key Questions & Viva Analysis

1. **What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?**
   - *Initial Bundle*: Downloaded, parsed, and executed immediately when the user enters the application's root URL. Contains the core React runtime, router definitions, layout shell (navbar/footer), and critical landing routes.
   - *Lazy-Loaded Chunk*: Downloaded via dynamic `import()` exclusively when the user navigates to the associated route or triggers the component action (e.g. opening a modal). If a user never visits that route or feature during a session, the chunk is never fetched.

2. **Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?**
   - It optimizes **First Contentful Paint (FCP)** and **Time to Interactive (TTI)**. The browser downloads and compiles a much smaller initial JavaScript payload (~247 kB instead of 1+ MB), allowing the main UI thread to unblock and render the home screen in a fraction of the time. Users perceive an instant-loading site; subsequent chunks download incrementally in the background when requested.

3. **In what situations would lazy loading not be worth the added complexity?**
   - In very small applications (< 50–100 kB total bundle) where splitting into tiny 1 kB chunks adds HTTP request overhead (DNS lookups, TCP handshakes, TLS negotiation).
   - For mission-critical above-the-fold content where showing a loading spinner degrades the core user experience.
   - When the user is guaranteed to visit all views immediately, making preloading or a single bundle more efficient.

---

## Practical 9: In-Memory Caching and Query Optimization

### Objective
To implement server-side in-memory caching using `node-cache`, ensure data consistency through proactive cache invalidation on write operations (`POST`, `PUT`, `DELETE`), evaluate single-task and collection-level caching, expose debug telemetry, and empirically measure API response time speedups.

---

### Architecture & Caching Pipeline

```
GET /tasks (or /tasks/:id) Request
              │
              ▼
    Cache Check (node-cache)
     ├── HIT (X-Cache: HIT)  ──────────────► Return in-memory cached JSON (Instant ~1.3 ms)
     └── MISS (X-Cache: MISS) ─────────────► Query MongoDB Collection
                                                   │
                                                   ├── Store in node-cache (TTL: 60s)
                                                   └── Return fresh JSON (~4.6 ms)

Write Operations (POST /tasks, PUT /tasks/:id, DELETE /tasks/:id)
              │
              ▼
   Persist change to MongoDB
              │
              ▼
   Cache Invalidation (invalidateUserTasks)
     ├── Delete user collection key: tasks:<userId>:all
     └── Delete single task key (if applicable): task:<userId>:<taskId>
              │
              ▼
   Subsequent GET is guaranteed a fresh cache MISS (No stale reads!)
```

---

### Key Features Implemented

1. **Shared Cache Module ([`task-manager-api/cache.js`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/task-manager-api/cache.js))**:
   - Initialized `NodeCache` instance with `stdTTL: 60` (60 seconds) and `checkperiod: 120`.
   - Formulates user-scoped cache keys (`tasks:<userId>:all` and `task:<userId>:<taskId>`) to ensure strict multi-tenant isolation and security.

2. **Collection Caching (`GET /tasks`)**:
   - Inspects in-memory cache first before hitting the database.
   - Sets response header `X-Cache: HIT` on cache hits and `X-Cache: MISS` on initial or post-invalidation database fetches.

3. **Single Task Caching (Supplementary Problem 1: `GET /tasks/:id`)**:
   - Single task queries are cached under dedicated item keys (`task:<userId>:<taskId>`).
   - Ensures high-throughput reads on frequently viewed task details without repeated database queries.

4. **Correct Cache Invalidation on Writes (`POST`, `PUT`, `DELETE`)**:
   - `POST /tasks`: Evicts `tasks:<userId>:all` so newly created tasks immediately appear in the next fetch.
   - `PUT /tasks/:id`: Evicts both `tasks:<userId>:all` and `task:<userId>:<taskId>` when title, status, or priority changes.
   - `DELETE /tasks/:id`: Evicts both `tasks:<userId>:all` and `task:<userId>:<taskId>`.

5. **Cache Telemetry & Debug Endpoint (Supplementary Problem 2: `GET /cache/stats`)**:
   - Exposes live runtime cache statistics: total hits, misses, hit ratio (`hits / total`), active keys count, and internal memory usage.
   - Includes `POST /cache/clear` endpoint to flush in-memory storage during automated testing.

---

### Empirical Response Time Benchmark

Measured using [`task-manager-api/test_cache_benchmark.js`](file:///v:/AIML(sub)/sem%205/ADWF/Practical/AWDF/task-manager-api/test_cache_benchmark.js) with 10 seeded tasks under identical local environment conditions:

| Sample Reading | Uncached (MongoDB Query) | Cached (`node-cache` Memory) | Cache Header |
|---|---:|---:|:---:|
| **Sample 1** | 4.53 ms | 1.47 ms | `X-Cache: HIT` |
| **Sample 2** | 4.88 ms | 1.32 ms | `X-Cache: HIT` |
| **Sample 3** | 4.41 ms | 1.44 ms | `X-Cache: HIT` |
| **Average Response Time** | **4.61 ms** | **1.41 ms** | **3.3x Speedup** |

*Single Task Endpoint (`GET /tasks/:id`):*
- **1st Call (Cache MISS):** 5.91 ms
- **2nd Call (Cache HIT):** 1.77 ms (3.34x faster)

*Cache Invalidation Verification:*
- Updating a task via `PUT /tasks/:id` immediately invalidated the cache.
- The next `GET /tasks` took 5.78 ms with `X-Cache: MISS`, confirming fresh database synchronization.

---

### TTL Trade-Off Experimentation (Supplementary Problem 3)

| TTL Window | Memory Overhead | Perceived Data Staleness | Best Use Case |
|---|---|---|---|
| **Short (5s – 10s)** | Minimal; keys expire rapidly | Very low; data is practically near real-time | Fast-changing collaborative sprint boards |
| **Medium (60s - Default)** | Balanced; keeps hot data in memory | Zero with write invalidation; 60s max for passive external changes | **General Task Management APIs (Optimal)** |
| **Long (300s+)** | Higher memory footprint for large collections | Risk of serving stale data if external systems bypass the API | Static reference data, read-heavy catalogs |

---

### Key Questions & Viva Analysis

1. **Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?**
   - In-memory caching stores a snapshot of data. When a user creates (`POST`), updates (`PUT`), or deletes (`DELETE`) a task, the underlying database state changes.
   - If the cache were not invalidated, subsequent `GET` requests would continue serving the old snapshot until the TTL expired. A user would see deleted tasks reappear, status changes revert, or new tasks vanish upon page refresh—violating fundamental CRUD data consistency and user trust.

2. **What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?**
   - A TTL of **60 seconds** is standard and practical for task management.
   - **Trade-off:**
     - *Longer TTL*: Maximizes cache hit ratio and offloads database read traffic, but increases memory usage and the risk of serving stale data if third-party background jobs update the database directly.
     - *Shorter TTL*: Guarantees data freshness even if invalidation hooks fail, but increases database query frequency and reduces the speedup benefits of caching.

3. **Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?**
   - `node-cache` stores data in the **local heap memory of a single Node.js process**.
   - In a production environment with horizontal scaling (e.g. 3 server instances behind a load balancer):
     - A write request routed to Instance A invalidates Instance A's local cache.
     - A subsequent read routed to Instance B or Instance C will still read their stale local memory!
     - In distributed architectures, an external, centralized caching tier such as **Redis** or **Memcached** must be used so all instances share a single, synchronized cache source of truth.
