function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="footer-container">
        <h3>Visrut Jajadiya</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
          Feel free to reach out for opportunities, collaborations, or technical discussions in Web Dev & AI/ML.
        </p>

        <div className="footer-socials">
          <a
            href="mailto:jajadiyavisrut7272@gmail.com"
            className="footer-social-link"
          >
            Email
          </a>
          <a
            href="https://github.com/Jajadiyavisrut"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/visrut-jajadiya/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-link"
          >
            LinkedIn
          </a>
        </div>

        <p className="footer-copyright">
          &copy; {currentYear} Visrut Jajadiya. Built with React & Vite for ADWF Practical 1.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
