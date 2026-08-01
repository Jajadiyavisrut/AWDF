import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'

function NavBar() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode)
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-brand">
        <span className="brand-mark">VJ</span>
        <div>
          <strong>Visrut Jajadiya</strong>
          <p>Resume portfolio</p>
        </div>
      </Link>

      <nav className="site-nav" aria-label="Primary navigation">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Home
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Projects
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Contact
        </NavLink>
        <NavLink to="/todo" className={({ isActive }) => (isActive ? 'active-link' : '')}>
          Todo List
        </NavLink>
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </nav>
    </header>
  )
}

export default NavBar
