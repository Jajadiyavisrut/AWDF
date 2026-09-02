import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

function AuthPage() {
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)

    if (isRegistering && !PASSWORD_PATTERN.test(password)) {
      setMessage('Password must contain 8+ characters, uppercase, lowercase, number, and special character.')
      return
    }

    if (isRegistering && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.')
      }

      if (isRegistering) {
        setIsRegistering(false)
        setPassword('')
        setConfirmPassword('')
        setMessage('Account created. Sign in to manage your tasks.')
      } else {
        saveToken(data.token)
        navigate('/todo')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-route-container">
      <section className="section-block auth-panel panel">
        <div className="section-heading">
          <p className="section-tag">Task Manager Access</p>
          <h2>{isRegistering ? 'Create your account' : 'Sign in to your tasks'}</h2>
        </div>

        {message && <div className="success-banner error-banner-alert">{message}</div>}

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              minLength={8}
              pattern={isRegistering ? PASSWORD_PATTERN.source : undefined}
              title={isRegistering ? 'Use 8+ characters with uppercase, lowercase, number, and special character.' : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                id="auth-confirm-password"
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
          )}
          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Login'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setIsRegistering((value) => !value)
                setMessage(null)
              }}
            >
              {isRegistering ? 'Use existing account' : 'Create account'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default AuthPage