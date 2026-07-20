# AWDF - Advanced Web Development Frameworks (ITUE301)

**CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY**  
**FACULTY OF TECHNOLOGY AND ENGINEERING**  
**B. TECH (AIML / IT / CE / CSE)**

Student: **Visrut Jajadiya**

---

## Practical 2: State Management and Routing in React

### Objective
To implement client-side SPA navigation using `react-router-dom` and reactive state management using the `useState` hook in the existing portfolio application.

---

### Architecture & Routes

* **`<BrowserRouter>`** wraps `<App />` in `main.jsx`
* **`<NavBar />`** provides client-side navigation using `<NavLink>` to prevent full page reloads and includes a Dark/Light Mode toggle.

| Path | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Portfolio main landing view with Hero section, About, Education, Experience, and Skills. |
| `/projects` | `Projects.jsx` | Dedicated showcase page displaying selected projects. |
| `/contact` | `Contact.jsx` | Controlled contact form with live state preview, live character counter, and tooltip toggle. |
| `*` | `NotFound.jsx` | Custom 404 error page for undefined routes with a home navigation link. |

---

### Key Features & `useState` Implementations

1. **Client-Side Routing (`react-router-dom` v6)**: Seamless navigation across routes without full page browser reloads.
2. **Controlled Form State**: `Contact.jsx` uses `useState` to capture input values and display live state changes in real time.
3. **Live Character Counter**: Real-time counter showing `character / maxChars` below the text area.
4. **UI Element Visibility Toggle**: `Contact.jsx` uses `useState` (`showTooltip`) to toggle help guidance visibility dynamically.
5. **Dark / Light Mode Toggle**: `NavBar.jsx` uses `useState` (`isDarkMode`) to toggle the theme on `document.documentElement` (`.dark-mode`).

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
