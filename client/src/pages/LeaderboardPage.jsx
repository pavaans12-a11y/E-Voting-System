import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function LeaderboardPage() {
  const [elections, setElections] = useState([])
  const [selectedElection, setSelectedElection] = useState(null)
  const [turnout, setTurnout] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/votes/leaderboard')
      .then(res => {
        setElections(res.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedElection) {
      api.get(`/votes/turnout/${selectedElection}`)
        .then(res => setTurnout(res.data.data))
        .catch(() => setTurnout(null))
    }
  }, [selectedElection])

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1>Live Leaderboard</h1>
          <p className="text-muted">Track turnout and results across elections</p>
        </div>
      </div>

      {elections.length === 0 ? (
        <div className="empty-state">
          <h3>No elections available</h3>
          <p>There are no active or completed elections to display.</p>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          {elections.map(e => (
            <div
              key={e._id}
              className={`card ${selectedElection === e._id ? 'selected' : ''}`}
              style={{ cursor: 'pointer', borderColor: selectedElection === e._id ? 'var(--gold)' : undefined }}
              onClick={() => setSelectedElection(e._id === selectedElection ? null : e._id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{e.title}</h3>
                  <span className={`badge mt-1 ${e.status === 'active' ? 'badge-success' : 'badge-primary'}`}>{e.status}</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/elections/${e._id}`} className="btn btn-secondary btn-sm" onClick={e => e.stopPropagation()}>Details</Link>
                  {e.status === 'completed' && (
                    <Link to={`/results/${e._id}`} className="btn btn-primary btn-sm" onClick={e => e.stopPropagation()}>Results</Link>
                  )}
                </div>
              </div>

              {selectedElection === e._id && turnout && (
                <div className="mt-3">
                  <div className="flex justify-between text-muted" style={{ fontSize: '0.85rem' }}>
                    <span>Turnout</span>
                    <span>{turnout.totalVotes} / {turnout.eligibleVoters} votes</span>
                  </div>
                  <div className="turnout-bar mt-1">
                    <div className="turnout-fill" style={{ width: `${Math.min(turnout.turnoutPercentage, 100)}%` }}></div>
                  </div>
                  <p className="text-muted mt-1" style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                    {turnout.turnoutPercentage}%
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
