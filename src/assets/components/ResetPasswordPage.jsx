import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)

    if (!PASSWORD_PATTERN.test(password)) {
      setMessage('Password must contain 8+ characters, uppercase, lowercase, number, and special character.')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not reset password.')
      setMessage(data.message)
      setTimeout(() => navigate('/login'), 1200)
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
          <h2>Choose a new password</h2>
        </div>
        {message && <div className="success-banner error-banner-alert">{message}</div>}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reset-confirm-password">Confirm new password</label>
            <input
              id="reset-confirm-password"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Please wait...' : 'Reset password'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ResetPasswordPage
