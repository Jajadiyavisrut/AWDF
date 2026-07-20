function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <p>&copy; {currentYear} Visrut Jajadiya. Built with React and Vite.</p>
      <a href="#home">Back to top</a>
    </footer>
  )
}

export default Footer
