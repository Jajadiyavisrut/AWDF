const skills = {
  Languages: ['Python', 'JavaScript', 'PHP', 'SQL'],
  Frontend: ['React', 'HTML5', 'CSS', 'Tailwind CSS'],
  'Backend & Database': ['Supabase', 'PostgreSQL', 'WordPress'],
  'AI / ML': ['scikit-learn', 'NLP', 'Data Science', 'Jupyter Notebook'],
  'Tools & Platforms': ['Git', 'Vite', 'Vercel'],
}

function TechnicalSkillsSection() {
  return (
    <section className="section-block" id="skills">
      <div className="section-heading">
        <p className="section-tag">Technical Skills</p>
        <h2>Tools and technologies I use regularly.</h2>
      </div>
      <div className="skill-grid">
        {Object.entries(skills).map(([category, items]) => (
          <article key={category} className="skill-card">
            <h3>{category}</h3>
            <div className="chip-row">
              {items.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TechnicalSkillsSection
