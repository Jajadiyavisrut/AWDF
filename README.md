# AWDF - Advanced Web Development Frameworks (ITUE301)

**CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY**  
**FACULTY OF TECHNOLOGY AND ENGINEERING**  
**B. TECH (AIML / IT / CE / CSE)**

Student: **Visrut Jajadiya**

---

## Practical 3: API Integration and Data Rendering in React

### Objective
To consume a public REST API in React using `fetch` and `useEffect`, while properly managing asynchronous states (`repos`, `loading`, `error`) and providing conditional UI feedback (Spinner, ErrorMessage with Retry, Search Filter).

---

### API Endpoint Used
* **GitHub Public Repositories API**: `https://api.github.com/users/Jajadiyavisrut/repos`

---

### Architecture & Components

* **`Projects.jsx`**:
  * Triggers API fetch on mount via `useEffect()` with an empty dependency array `[]`.
  * Manages state with `useState`: `repos` (array), `loading` (boolean), `error` (string/null), and `searchQuery` (string).
  * Implements live search filtering to filter repositories by name.

* **`Spinner.jsx`**:
  * Rendered conditionally while `loading === true`.
  * Features an animated CSS spinner ring.

* **`ErrorMessage.jsx`**:
  * Rendered conditionally if an API fetch error occurs (`error !== null`).
  * Includes a **Retry Fetching** button (`onRetry`) to re-trigger data fetching.

---

### Key Features Implemented

1. **REST API Data Fetching**: Asynchronous data retrieval using standard `fetch` API.
2. **Conditional UI State Rendering**:
   - `loading` → `<Spinner />`
   - `error` → `<ErrorMessage message={error} onRetry={fetchRepos} />`
   - `success` → Render dynamic list of GitHub repositories.
3. **Repository Metadata**: Renders repository name, star count (`⭐ stargazers_count`), primary language, description, and direct link (`html_url`).
4. **Live Search Filter**: Real-time text filter input allowing users to filter repositories by title.
5. **Error Recovery**: Interactive Retry button to re-run `fetchRepos()` on network failure.

---

## Practical 2: State Management and Routing in React

* Client-side routing with `react-router-dom` v6 (`/`, `/projects`, `/contact`, `*`).
* Dark/Light Mode toggle using `useState` in `NavBar.jsx`.
* Controlled Contact Form with live character counter and UI tooltip visibility toggle.

---

### How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
