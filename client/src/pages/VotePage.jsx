import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import TiltCard from '../components/TiltCard'

export default function VotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/elections/${id}`)
        const data = res.data.data
        if (data.status !== 'active') {
          setError('This election is not currently active.')
          setLoading(false)
          return
        }
        setElection(data)
        setCandidates(data.candidates || [])
      } catch (err) {
        setError('Failed to load election data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async () => {
    if (!selectedCandidate) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/votes', {
        electionId: id,
        candidateId: selectedCandidate,
      })
      setSuccess(res.data.data)
      setShowConfirm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vote')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCandidateData = candidates.find(c => c._id === selectedCandidate)

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>
  }

  if (success) {
    return (
      <div className="vote-success-overlay">
        <div className="seal">&#9878;</div>
        <h2>Your Vote Has Been Cast</h2>
        <p>Your voice has been recorded securely in the chamber.</p>
        {success.receiptToken && (
          <div className="receipt-token">{success.receiptToken}</div>
        )}
        <div className="flex gap-2" style={{ marginTop: 24 }}>
          {success.receiptToken && (
            <Link to={`/receipt/${success.receiptToken}`} className="btn btn-primary btn-lg">
              View Receipt
            </Link>
          )}
          <Link to="/elections" className="btn btn-outline btn-lg">
            Back to Chamber
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link to={`/elections/${id}`} className="btn btn-outline btn-sm mb-3">&larr; Back to Election</Link>

      <div className="card mb-4">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{election?.title}</h2>
        <p className="text-muted mt-1">Select your candidate and cast your vote.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {candidates.length === 0 && !error && (
        <div className="empty-state">
          <h3>No candidates available</h3>
          <p>There are no candidates in this election yet.</p>
        </div>
      )}

      {candidates.length > 0 && !error && (
        <>
          <div className="grid mb-4" style={{ gap: 12 }}>
            {candidates.map((candidate) => (
              <TiltCard
                key={candidate._id}
                className={`candidate-card ${selectedCandidate === candidate._id ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(candidate._id)}
              >
                <img
                  src={candidate.photo || 'https://via.placeholder.com/64'}
                  alt={candidate.name}
                  className="candidate-photo"
                />
                <div className="candidate-info" style={{ flex: 1 }}>
                  <h4>{candidate.name}</h4>
                  {candidate.statement && <p>{candidate.statement}</p>}
                </div>
                <input
                  type="radio"
                  name="candidate"
                  value={candidate._id}
                  checked={selectedCandidate === candidate._id}
                  onChange={() => setSelectedCandidate(candidate._id)}
                  style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--gold)' }}
                />
              </TiltCard>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg btn-block"
            disabled={!selectedCandidate || submitting}
            onClick={() => setShowConfirm(true)}
          >
            {submitting ? <span className="spinner spinner-sm"></span> : 'Cast Your Vote'}
          </button>
        </>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="confirm-icon">&#9888;</div>
            <h3>Confirm Your Vote</h3>
            <p>
              You are voting for <strong>{selectedCandidateData?.name}</strong>.
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-center">
              <button className="btn btn-outline btn-lg" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="spinner spinner-sm"></span> : 'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
