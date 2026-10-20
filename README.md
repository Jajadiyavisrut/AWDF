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
