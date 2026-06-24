import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const webcamRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [photo, setPhoto] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setPhoto(imageSrc)
      setShowCamera(false)
    }
  }, [webcamRef])

  const retakePhoto = () => {
    setPhoto(null)
    setShowCamera(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!photo) {
      setError('Please capture your photo')
      return
    }

    setLoading(true)
    try {
      await register(form.name, form.email, form.phone, photo, form.password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <h2>Create Account</h2>
        <p className="subtitle">Register to participate in elections</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Photo Capture</label>
            {!photo && !showCamera && (
              <div className="photo-capture">
                <p className="mb-2 text-muted">Take a photo for identity verification</p>
                <button type="button" className="btn btn-primary" onClick={() => setShowCamera(true)}>
                  📸 Open Camera
                </button>
              </div>
            )}

            {showCamera && (
              <div className="photo-capture">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }}
                />
                <div className="photo-actions">
                  <button type="button" className="btn btn-primary" onClick={capture}>
                    Capture
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCamera(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {photo && (
              <div className="text-center">
                <img src={photo} alt="Captured" className="photo-preview" />
                <div className="photo-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={retakePhoto}>
                    Retake Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <span className="spinner spinner-sm"></span> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
