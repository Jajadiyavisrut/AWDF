function Skills({ skillList = [] }) {
  return (
    <section className="section" id="skills">
      <h2 className="section-title">Technical Skills</h2>
      <p className="section-subtitle">
        A catalog of my programming proficiencies, libraries, and tools in data science and full-stack development.
      </p>

      <div className="glass-panel">
        <ul className="skills-list" style={{ paddingLeft: 0 }}>
          {skillList.map((skill) => (
            <li key={skill} className="skill-pill">
              <span className="skill-dot"></span>
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Skills;
