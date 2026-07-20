function Spinner({ username = 'GitHub user' }) {
  return (
    <div className="spinner-container" aria-live="polite" aria-busy="true">
      <div className="spinner-ring"></div>
      <p className="spinner-text">Fetching repositories for "{username}" from GitHub...</p>
    </div>
  )
}

export default Spinner
