function Projects() {
  const projectList = [
    {
      id: 1,
      title: "SmartBudget AI",
      description: "An intelligent personal finance dashboard that uses natural language processing to automatically categorize expenses and generate predictive monthly budget forecasts.",
      technologies: ["React", "Node.js", "Express", "NLP.js"],
      link: "https://github.com/Jajadiyavisrut"
    },
    {
      id: 2,
      title: "NeuroDoc Diagnosis",
      description: "A clinical diagnostic assistant powered by fine-tuned Transformer models. It interprets symptoms entered in plain English to recommend potential clinical specialist paths.",
      technologies: ["React", "FastAPI", "Python", "PyTorch"],
      link: "https://github.com/Jajadiyavisrut"
    },
    {
      id: 3,
      title: "FitFlow Pose Tracker",
      description: "A web-based interactive fitness application utilizing computer vision to evaluate pose posture in real time, delivering instant biomechanical feedback during exercises.",
      technologies: ["React", "TensorFlow.js", "WebRTC", "Canvas API"],
      link: "https://github.com/Jajadiyavisrut"
    }
  ];

  return (
    <section className="section" id="projects">
      <h2 className="section-title">Featured Projects</h2>
      <p className="section-subtitle">
        A selection of recent applications spanning web technologies, machine learning workflows, and practical user interfaces.
      </p>

      <div className="projects-grid">
        {projectList.map((project) => (
          <div key={project.id} className="glass-panel project-card">
            <h3>{project.title}</h3>
            <p className="project-desc">{project.description}</p>
            <div className="project-tech">
              {project.technologies.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
              View Repository &rarr;
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
