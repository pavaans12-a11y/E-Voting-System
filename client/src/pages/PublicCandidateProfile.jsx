import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'

export default function PublicCandidateProfile() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/elections`)
        const allElections = res.data.data || []
        const found = []
        for (const e of allElections) {
          const match = (e.candidates || []).find(
            c => (c._id || c) === id
          )
          if (match) {
            found.push({ election: e, candidate: match })
          }
        }
        if (found.length > 0) {
          setCandidate(found[0].candidate)
          setElections(found.map(f => f.election))
        } else {
          setError('Candidate not found')
        }
      } catch (err) {
        setError('Failed to load candidate profile')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  if (!candidate) {
    return (
      <div className="empty-state">
        <h3>Candidate not found</h3>
        <Link to="/elections" className="btn btn-primary">Browse Elections</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link to="/elections" className="btn btn-outline btn-sm mb-3">&larr; Back to Elections</Link>

      <div className="card mb-4 text-center">
        <div className="seal" style={{ margin: '0 auto 20px' }}>
          {candidate.photo ? (
            <img src={candidate.photo} alt={candidate.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            '&#9878;'
          )}
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>{candidate.name}</h1>
        {candidate.email && <p className="text-muted">{candidate.email}</p>}
        {candidate.statement && (
          <p style={{ marginTop: 16, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{candidate.statement}</p>
        )}
      </div>

      {elections.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Contesting In</h3>
          </div>
          <div className="grid" style={{ gap: 12 }}>
            {elections.map(e => (
              <Link key={e._id} to={`/elections/${e._id}`} className="candidate-spotlight" style={{ textDecoration: 'none' }}>
                <div className="spotlight-info">
                  <h4>{e.title}</h4>
                  <span className={`badge badge-${e.status === 'active' ? 'success' : e.status === 'completed' ? 'primary' : 'secondary'}`} style={{ marginTop: 4 }}>{e.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
