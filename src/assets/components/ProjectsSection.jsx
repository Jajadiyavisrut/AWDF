const projects = [
  {
    name: 'Financia',
    stack: 'React, TypeScript, Supabase, Tailwind CSS, Recharts',
    link: 'https://financia-vi.vercel.app',
    points: [
      'Full-featured personal finance manager with budgets, categories, analytics, and Excel/PDF export.',
      'Supports shareable read-only snapshots with expiring codes and is deployed on Vercel.',
    ],
  },
  {
    name: 'Resume vs Job Description Analyser',
    stack: 'Python, NLP, scikit-learn',
    points: [
      'NLP-powered ML model that compares a resume against a job description and scores relevance.',
      'Learns incrementally from new documents over time using an adaptive training pipeline.',
    ],
  },
  {
    name: 'WellFit – Smart Fitness & Nutrition Assistant',
    stack: 'Python, AI',
    points: [
      'AI-driven fitness and nutrition planning assistant providing personalised health recommendations.',
    ],
  },
  {
    name: 'Budget & Expenses Analyser',
    stack: 'JavaScript, Web',
    points: [
      'Localhost-based budgeting tool for tracking and visualising personal expenses across categories.',
    ],
  },
]

function ProjectsSection() {
  return (
    <section className="section-block" id="projects">
      <div className="section-heading">
        <p className="section-tag">Projects</p>
        <h2>Selected work across frontend, ML, and productivity tools.</h2>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <article key={project.name} className="project-card">
            <div className="project-head">
              <h3>{project.name}</h3>
              {project.link ? (
                <a href={project.link} target="_blank" rel="noreferrer">
                  Live
                </a>
              ) : null}
            </div>
            <p className="project-stack">{project.stack}</p>
            <ul>
              {project.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProjectsSection
