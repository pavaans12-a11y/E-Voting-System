import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import TiltCard from '../components/TiltCard'

export default function ElectionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [election, setElection] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await api.get(`/elections/${id}`)
        setElection(res.data.data)
      } catch (err) {
        setError('Failed to load election details')
      } finally {
        setLoading(false)
      }
    }
    fetchElection()
  }, [id])

  useEffect(() => {
    if (election?.status === 'completed') {
      api.get(`/votes/results/${id}`)
        .then(res => setResults(res.data.data))
        .catch(() => {})
    }
  }, [id, election?.status])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusBadge = (status) => {
    const map = {
      pending: 'badge badge-warning',
      active: 'badge badge-success',
      completed: 'badge badge-primary',
      cancelled: 'badge badge-danger',
    }
    return <span className={map[status] || 'badge badge-secondary'}>{status}</span>
  }

  const canVote = election?.status === 'active'
  const now = new Date()
  const nomDeadline = election?.nominationDeadline ? new Date(election.nominationDeadline) : null
  const canNominate = election?.status === 'pending' && (!nomDeadline || now < nomDeadline)
  const eligibleCount = election?.eligibleVoters?.length || 0
  const turnoutPercent = eligibleCount > 0 ? Math.round((election.totalVotes / eligibleCount) * 100) : 0

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  if (!election) {
    return (
      <div className="empty-state">
        <h3>Election not found</h3>
        <Link to="/elections" className="btn btn-primary">Back to Chamber</Link>
      </div>
    )
  }

  return (
    <div>
        <Link to="/elections" className="btn btn-outline btn-sm mb-3">&larr; Back to Chamber</Link>

      <div className="card mb-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>{election.title}</h1>
            <div className="flex gap-2 items-center flex-wrap">
              {statusBadge(election.status)}
              <span className="badge badge-primary">{election.instanceType}</span>
            </div>
          </div>
        </div>

        {election.description && (
          <p className="mt-2" style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{election.description}</p>
        )}

        <div className="grid grid-2 mt-3" style={{ gap: 16 }}>
          <div><strong>Start:</strong> {formatDate(election.startTime)}</div>
          <div><strong>End:</strong> {formatDate(election.endTime)}</div>
          {election.nominationDeadline && (
            <div><strong>Nomination Deadline:</strong> {formatDate(election.nominationDeadline)}</div>
          )}
          <div><strong>Total Voters:</strong> {eligibleCount}</div>
        </div>

        {election.status === 'active' && (
          <div className="mt-3">
            <strong>Turnout:</strong> {election.totalVotes || 0} / {eligibleCount} votes ({turnoutPercent}%)
            <div className="turnout-bar">
              <div className="turnout-fill" style={{ width: `${turnoutPercent}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {canVote && (
          <Link to={`/vote/${id}`} className="btn btn-primary">
            Cast Your Vote
          </Link>
        )}
        {canNominate && (
          <Link to={`/elections/${id}/nominate`} className="btn btn-outline">
            Nominate Yourself
          </Link>
        )}
      </div>

      {election.candidates && election.candidates.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Candidates ({election.candidates.length})</h3>
          </div>
          <div className="grid" style={{ gap: 12 }}>
            {election.candidates.map((candidate) => (
              <TiltCard key={candidate._id} className="candidate-spotlight">
                <img
                  src={candidate.photo || 'https://via.placeholder.com/64'}
                  alt={candidate.name}
                  className="spotlight-avatar"
                />
                <div className="spotlight-info">
                  <h4>{candidate.name}</h4>
                  {candidate.email && <p>{candidate.email}</p>}
                  {candidate.statement && <p style={{ marginTop: 4 }}>{candidate.statement}</p>}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No candidates yet</h3>
          <p>Candidates will appear here once nominations are processed.</p>
        </div>
      )}

      {election.status === 'completed' && results && (
        <div className="card mt-4">
          <div className="card-header">
            <h3 className="card-title">&#9878; Final Results</h3>
          </div>
          {results.results
            .sort((a, b) => b.votes - a.votes)
            .map((r, i) => (
            <div key={i} className={`flex justify-between items-center p-3 ${i === 0 ? 'winner-highlight' : ''}`} style={{ borderBottom: i < results.results.length - 1 ? '1px solid var(--border)' : 'none', borderRadius: i === 0 ? 'var(--radius)' : 0 }}>
              <span className="flex items-center gap-3">
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, var(--gold), var(--gold-dark))' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: i === 0 ? 'var(--navy)' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</span>
                {r.candidate?.photo && (
                  <img src={r.candidate.photo} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: i === 0 ? '2px solid var(--gold)' : '2px solid var(--border)', boxShadow: i === 0 ? '0 0 20px rgba(201, 168, 76, 0.2)' : 'none' }} />
                )}
                <div>
                  <strong style={{ color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{r.candidate?.name || 'Unknown'}</strong>
                  {i === 0 && <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: '0.65rem' }}>Winner</span>}
                </div>
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.82rem', padding: '6px 16px' }}>{r.votes} {r.votes === 1 ? 'vote' : 'votes'}</span>
            </div>
          ))}
          <div className="p-3 text-muted" style={{ textAlign: 'right', borderTop: '1px solid var(--border)', fontSize: '0.82rem' }}>Total votes cast: {results.election?.totalVotes || 0}</div>
        </div>
      )}
    </div>
  )
}
