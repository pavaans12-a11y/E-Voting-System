import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'

export default function ResultsPage() {
  const { id } = useParams()
  const [election, setElection] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [elecRes, resRes] = await Promise.all([
          api.get(`/elections/${id}`),
          api.get(`/votes/results/${id}`),
        ])
        setElection(elecRes.data.data)
        setResults(resRes.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
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
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Link to="/elections" className="btn btn-outline btn-sm mb-3">&larr; Back to Elections</Link>

      <div className="card mb-4">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{election?.title}</h1>
        <span className="badge badge-primary" style={{ marginTop: 8 }}>Completed</span>
        <p className="text-muted mt-2">Total votes cast: {results?.election?.totalVotes || totalVotes}</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">&#9878; Final Results</h3>
        </div>
        {sorted.map((r, i) => {
          const pct = totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(1) : 0
          return (
            <div key={i} className={`flex justify-between items-center p-3 ${i === 0 ? 'winner-highlight' : ''}`} style={{ borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none', borderRadius: i === 0 ? 'var(--radius)' : 0 }}>
              <span className="flex items-center gap-3">
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? 'var(--navy)' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</span>
                {r.candidate?.photo && (
                  <img src={r.candidate.photo} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: i === 0 ? '2px solid var(--gold)' : '2px solid var(--border)' }} />
                )}
                <div>
                  <strong style={{ color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{r.candidate?.name || 'Unknown'}</strong>
                  {i === 0 && <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: '0.65rem' }}>Winner</span>}
                </div>
              </span>
              <div className="flex items-center gap-2">
                <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? 'linear-gradient(90deg, var(--gold), var(--gold-light))' : 'rgba(255,255,255,0.1)', borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '6px 16px', minWidth: 60, textAlign: 'center' }}>{r.votes}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
