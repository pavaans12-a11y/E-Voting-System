import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import api from '../utils/api'

export default function NominatePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const webcamRef = useRef(null)
  const [election, setElection] = useState(null)
  const [statement, setStatement] = useState('')
  const [photo, setPhoto] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/elections/${id}`)
      .then(res => setElection(res.data.data))
      .catch(() => navigate('/elections'))
  }, [id, navigate])

  const capturePhoto = () => {
    const imageSrc = webcamRef?.getScreenshot()
    if (imageSrc) {
      setPhoto(imageSrc)
      setShowCamera(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/nominations', {
        electionId: id,
        statement,
        photo,
      })
      navigate('/my-nominations')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit nomination')
    } finally {
      setSubmitting(false)
    }
  }

  if (!election) return <div className="spinner-container"><div className="spinner"></div></div>

  return (
    <div className="page-container">
      <div className="form-card">
        <h1>Nominate Yourself</h1>
        <div className="election-summary">
          <h2>{election.title}</h2>
          <span className={`badge badge-${election.instanceType}`}>{election.instanceType}</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Statement (why should voters choose you?)</label>
            <textarea
              className="form-textarea"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={5}
              placeholder="Tell voters about yourself, your vision, and why you're the right choice..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Campaign Photo</label>
            {photo ? (
              <div className="text-center">
                <img src={photo} alt="Campaign" className="photo-preview--framed" />
                <div className="photo-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setPhoto(null)}>
                    Remove Photo
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button type="button" className="btn btn-outline" onClick={() => setShowCamera(!showCamera)}>
                  {showCamera ? 'Cancel' : 'Take Photo'}
                </button>
                {showCamera && (
                  <div className="camera-container">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="webcam"
                    />
                    <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                      Capture
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Nomination'}
          </button>
        </form>
      </div>
    </div>
  )
}
