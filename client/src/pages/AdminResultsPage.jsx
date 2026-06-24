import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminResultsPage() {
  const { id } = useParams()
  const [election, setElection] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, rRes] = await Promise.all([
          api.get(`/elections/${id}`),
          api.get(`/votes/results/${id}`),
        ])
        setElection(eRes.data.data)
        setResults(rRes.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results')
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

  const sorted = [...(results?.results || [])].sort((a, b) => b.votes - a.votes)
  const totalVotes = sorted.reduce((sum, r) => sum + r.votes, 0)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link to="/admin/elections" className="btn btn-outline btn-sm mb-3">&larr; Back to Elections</Link>

      <div className="page-header">
        <div>
          <h1>Results: {election?.title}</h1>
          <span className="badge badge-primary mt-1">{election?.instanceType}</span>
          <span className="badge badge-success mt-1" style={{ marginLeft: 8 }}>{election?.status}</span>
        </div>
        <Link to={`/admin/export/${id}`} className="btn btn-primary">
          Export Results
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalVotes}</div>
          <div className="stat-label">Total Votes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{election?.eligibleVoters?.length || 0}</div>
          <div className="stat-label">Eligible Voters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {election?.eligibleVoters?.length > 0
              ? ((totalVotes / election.eligibleVoters.length) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="stat-label">Turnout</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sorted.length}</div>
          <div className="stat-label">Candidates</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">&#9878; Detailed Results</h3>
        </div>
        {sorted.map((r, i) => {
          const pct = totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(1) : 0
          return (
            <div key={i} className={`p-3 ${i === 0 ? 'winner-highlight' : ''}`} style={{ borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-3">
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? 'var(--navy)' : 'var(--text-muted)' }}>{i + 1}</span>
                  {r.candidate?.photo && <img src={r.candidate.photo} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)' }} />}
                  <strong>{r.candidate?.name || 'Unknown'}</strong>
                  {i === 0 && <span className="badge badge-primary">Winner</span>}
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>{r.votes} votes</span>
              </div>
              <div className="mt-2">
                <div style={{ height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? 'linear-gradient(90deg, var(--gold), var(--gold-light))' : 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))', borderRadius: 6, transition: 'width 1.5s ease' }} />
                </div>
                <div className="text-muted mt-1" style={{ fontSize: '0.8rem', textAlign: 'right' }}>{pct}% of votes</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
