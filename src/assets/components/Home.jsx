import { Link } from 'react-router-dom'
import ExperienceSection from './ExperienceSection'
import TechnicalSkillsSection from './TechnicalSkillsSection'

function Home() {
  return (
    <>
      <section className="hero-section" id="home">
        <div className="hero-copy">
          <p className="eyebrow">AI/ML student · Full stack developer · Builder</p>
          <h1>Visrut Jajadiya</h1>
          <p className="hero-text">
            I build practical web products and ML-powered tools that turn ideas into
            responsive, useful experiences.
          </p>
          <div className="cta-row">
            <Link className="primary-button" to="/contact">
              Get in Touch
            </Link>
            <Link className="secondary-button" to="/projects">
              View Projects
            </Link>
            <a
              className="ghost-button"
              href="https://github.com/Jajadiyavisrut"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>

        <aside className="hero-card">
          <div>
            <span className="card-label">Contact</span>
            <h2>Open to internships and junior roles</h2>
          </div>
          <ul className="contact-list">
            <li>
              <span>Phone</span>
              <a href="tel:+916352336162">+91 6352336162</a>
            </li>
            <li>
              <span>Email</span>
              <a href="mailto:jajadiyavisrut7272@gmail.com">jajadiyavisrut7272@gmail.com</a>
            </li>
            <li>
              <span>LinkedIn</span>
              <a
                href="https://www.linkedin.com/in/visrut-jajadiya/"
                target="_blank"
                rel="noreferrer"
              >
                linkedin.com/visrut-jajadiya
              </a>
            </li>
            <li>
              <span>GitHub</span>
              <a href="https://github.com/Jajadiyavisrut" target="_blank" rel="noreferrer">
                github.com/Jajadiyavisrut
              </a>
            </li>
            <li>
              <span>LeetCode</span>
              <a href="https://leetcode.com/visrut6162" target="_blank" rel="noreferrer">
                leetcode.com/visrut6162
              </a>
            </li>
          </ul>
        </aside>
      </section>

      <section className="stats-section" aria-label="Highlights">
        <article>
          <strong>3+</strong>
          <span>Internships across full stack and web development</span>
        </article>
        <article>
          <strong>4</strong>
          <span>Projects spanning finance, NLP, fitness, and budgeting</span>
        </article>
        <article>
          <strong>8.00</strong>
          <span>Current B.Tech SGPA at CSPIT, CHAROTAR University</span>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel" id="about">
          <p className="section-tag">About</p>
          <h2>Focused on real product work, clean UI, and applied ML.</h2>
          <p>
            I am currently pursuing a B.Tech in Artificial Intelligence & Machine
            Learning while also building full stack applications and working with
            practical data-driven workflows.
          </p>
        </article>

        <article className="panel" id="education">
          <p className="section-tag">Education</p>
          <div className="timeline-item">
            <h3>CSPIT, CHAROTAR University</h3>
            <p>B.Tech in Artificial Intelligence & Machine Learning</p>
            <span>2025 – 2028 · SGPA 8.00 (up to 4th Sem)</span>
          </div>
          <div className="timeline-item">
            <h3>Dr. S & S.S. Gandhi Polytechnic</h3>
            <p>Diploma in Information Technology</p>
            <span>2022 – 2025 · CGPA 7.78</span>
          </div>
        </article>
      </section>

      <ExperienceSection />
      <TechnicalSkillsSection />

      <section className="section-block final-strip" id="certifications">
        <article className="panel compact-panel">
          <p className="section-tag">Certification</p>
          <h2>IBM Data Science Professional Certificate</h2>
          <p>Issued through Coursera.</p>
        </article>

        <article className="panel compact-panel">
          <p className="section-tag">Let's Connect</p>
          <h2>Available for collaboration, internships, and freelance work.</h2>
          <p>Reach me through email, LinkedIn, or GitHub for opportunities.</p>
        </article>
      </section>
    </>
  )
}

export default Home
