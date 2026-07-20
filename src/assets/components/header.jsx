function Header() {
  return (
    <header className="site-header">
      <div className="site-brand">
        <span className="brand-mark">VJ</span>
        <div>
          <strong>Visrut Jajadiya</strong>
          <p>Resume portfolio</p>
        </div>
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <a href="#about">About</a>
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#skills">Skills</a>
        <a href="#certifications">Contact</a>
      </nav>
    </header>
  )
}

export default Header
