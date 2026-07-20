import { useState } from 'react'

function Contact() {
  // useState 1: Controlled form input state for user message & details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  // useState 2: Visibility toggle state for guidance/help tooltip
  const [showTooltip, setShowTooltip] = useState(false)

  // useState 3: Submission status feedback state
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.message) return
    setSubmitted(true)
  }

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' })
    setSubmitted(false)
  }

  const maxChars = 250
  const charCount = formData.message.length

  return (
    <div className="contact-page-container">
      <div className="section-heading">
        <p className="section-tag">Contact & Feedback</p>
        <h2>Get in touch or leave a message</h2>
      </div>

      {/* State Variable 2: Visibility Toggle UI */}
      <div className="tooltip-section">
        <button
          type="button"
          className="ghost-button tooltip-toggle-btn"
          onClick={() => setShowTooltip(!showTooltip)}
        >
          {showTooltip ? '🙈 Hide Guidance' : '💡 Need help writing a message?'}
        </button>

        {showTooltip && (
          <div className="tooltip-box">
            <p>
              <strong>Tip:</strong> Mention specific topics like web development, project
              collaborations, ML model training, or internship opportunities!
            </p>
          </div>
        )}
      </div>

      <div className="contact-grid">
        {/* Controlled Form using useState */}
        <form className="contact-form panel" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name-input">Full Name *</label>
            <input
              id="name-input"
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="message-input">Your Message *</label>
            <textarea
              id="message-input"
              name="message"
              rows={5}
              maxLength={maxChars}
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleInputChange}
              required
            />
            {/* Live character count requirement */}
            <div className="char-count">
              <span>{charCount} / {maxChars} characters</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Send Message
            </button>
            <button type="button" className="ghost-button" onClick={handleReset}>
              Reset Form
            </button>
          </div>
        </form>

        {/* Real-time State Preview Panel */}
        <div className="preview-panel panel">
          <p className="section-tag">Live Input Preview</p>
          <h3>Real-time State Sync</h3>

          <div className="preview-content">
            <div className="preview-field">
              <strong>Name:</strong>
              <p>{formData.name ? formData.name : '—'}</p>
            </div>
            <div className="preview-field">
              <strong>Email:</strong>
              <p>{formData.email ? formData.email : '—'}</p>
            </div>
            <div className="preview-field">
              <strong>Message:</strong>
              <p className="preview-message">
                {formData.message ? formData.message : 'Your message will appear here in real-time as you type...'}
              </p>
            </div>
          </div>

          {submitted && (
            <div className="success-banner">
              ✅ Thank you, {formData.name}! Your message has been recorded locally.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact
