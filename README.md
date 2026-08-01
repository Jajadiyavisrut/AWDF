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
