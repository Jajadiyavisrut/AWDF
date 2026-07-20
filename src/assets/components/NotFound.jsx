import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="not-found-container panel">
      <p className="section-tag">404 Error</p>
      <h1>Page Not Found</h1>
      <p className="not-found-text">
        The route you are trying to access does not exist or has been moved.
      </p>
      <Link to="/" className="primary-button">
        ← Return to Home
      </Link>
    </div>
  )
}

export default NotFound
