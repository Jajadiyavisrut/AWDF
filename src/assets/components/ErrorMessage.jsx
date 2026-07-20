function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container panel" role="alert">
      <div className="error-icon">⚠️</div>
      <h3>Failed to Load Data</h3>
      <p className="error-message">{message || 'An unexpected error occurred while fetching repositories.'}</p>
      {onRetry && (
        <button type="button" className="primary-button retry-btn" onClick={onRetry}>
          🔄 Retry Fetching
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
