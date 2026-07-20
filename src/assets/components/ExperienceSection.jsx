const experience = [
  {
    role: 'Full Stack Developer Intern',
    company: 'Vijayho',
    location: 'Surat, Gujarat',
    period: 'Jun 2024 – Aug 2024',
    points: [
      'Built and maintained full-stack web features using HTML5, CSS, and JavaScript.',
      'Collaborated with the product team to deliver responsive UI components on schedule.',
    ],
  },
  {
    role: 'Web Developer Intern',
    company: 'Codevirus Security',
    location: 'Surat, Gujarat',
    period: 'Mar 2024 – Jun 2024',
    points: [
      'Developed web applications using PHP and managed project delivery and client coordination.',
      'Worked across 6+ skill areas including backend logic and project management.',
    ],
  },
  {
    role: 'Web Developer Intern',
    company: 'Gruhinee Platforms Pvt. Ltd.',
    location: 'Surat, Gujarat',
    period: 'Aug 2023',
    points: ['Converted PSD designs to WordPress themes using PHP.'],
  },
]

function ExperienceSection() {
  return (
    <section className="section-block" id="experience">
      <div className="section-heading">
        <p className="section-tag">Experience</p>
        <h2>Internships that shaped my web development workflow.</h2>
      </div>
      <div className="timeline">
        {experience.map((item) => (
          <article key={`${item.company}-${item.period}`} className="timeline-card">
            <div className="timeline-meta">
              <span>{item.period}</span>
              <span>{item.location}</span>
            </div>
            <h3>{item.role}</h3>
            <p className="timeline-company">{item.company}</p>
            <ul>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ExperienceSection
