import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [elections, setElections] = useState([])
  const [nominations, setNominations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [elecRes, nomRes] = await Promise.all([
          api.get('/elections'),
          api.get('/nominations/my'),
        ])
        setElections(elecRes.data.data || [])
        setNominations(nomRes.data.data || [])
      } catch (err) {
        setError('Failed to load elections')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const now = new Date()

  const activeElections = elections.filter(e => e.status === 'active')

  const closingSoon = activeElections.filter(e => {
    const end = new Date(e.endTime)
    const diffHours = (end - now) / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= 24
  })

  const upcomingElections = elections.filter(e => e.status === 'pending')

  const pendingNoms = nominations.filter(n => n.status === 'pending')
  const approvedNoms = nominations.filter(n => n.status === 'approved')
  const rejectedNoms = nominations.filter(n => n.status === 'rejected')

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const timeRemaining = (endTime) => {
    const diff = new Date(endTime) - now
    if (diff <= 0) return 'Ended'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h remaining`
    }
    return `${hours}h ${mins}m remaining`
  }

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome to the Chamber, {user?.name || 'Voter'}</h1>
          <p className="text-muted">View active elections and cast your vote</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{activeElections.length}</div>
          <div className="stat-label">Active Elections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{upcomingElections.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{elections.filter(e => e.status === 'completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{closingSoon.length}</div>
          <div className="stat-label">Closing Soon</div>
        </div>
      </div>

      {nominations.length > 0 && (
        <div className="dashboard-section dashboard-section--full" style={{ marginBottom: 24 }}>
          <h2>My Nominations</h2>
          <div className="election-cards">
            <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
              <span className="badge badge-warning">{pendingNoms.length} Pending</span>
              <span className="badge badge-success">{approvedNoms.length} Approved</span>
              <span className="badge badge-danger">{rejectedNoms.length} Rejected</span>
            </div>
            <div className="election-cards">
              {nominations.slice(0, 3).map(nom => (
                <div key={nom._id} className="active-election-card" style={{ opacity: nom.status === 'rejected' ? 0.6 : 1 }}>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3>{nom.election?.title || 'Unknown Election'}</h3>
                      <span className={`badge badge-${nom.status}`}>{nom.status}</span>
                    </div>
                    <Link to={`/elections/${nom.election?._id}`} className="btn btn-outline btn-sm">View Election</Link>
                  </div>
                  {nom.statement && <p style={{ fontSize: '0.85rem', marginTop: 8, fontStyle: 'italic' }}>"{nom.statement}"</p>}
                </div>
              ))}
            </div>
            {nominations.length > 3 && (
              <Link to="/my-nominations" className="btn btn-outline btn-sm mt-2">View All Nominations</Link>
            )}
          </div>
        </div>
      )}

      {closingSoon.length > 0 && (
        <div className="dashboard-section dashboard-section--full" style={{ marginBottom: 24, borderColor: 'var(--accent)' }}>
          <h2>Closing Soon</h2>
          <div className="election-cards">
            {closingSoon.map(election => (
              <div key={election._id} className="active-election-card" style={{ borderColor: 'var(--accent)', background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(10, 22, 40, 0.8))' }}>
                <div className="election-card-glow" />
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3>{election.title}</h3>
                    <span className="badge badge-success">Active</span>
                    <span className="badge badge-primary" style={{ marginLeft: 8 }}>{election.instanceType}</span>
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                    {timeRemaining(election.endTime)}
                  </span>
                </div>
                <p>{election.description}</p>
                <div className="election-card-meta">
                  <span>Ends: {formatDate(election.endTime)}</span>
                  <span>{election.candidates?.length || 0} candidates</span>
                  <span>{election.totalVotes || 0} votes cast</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link to={`/elections/${election._id}`} className="btn btn-outline btn-sm">View Details</Link>
                  <Link to={`/vote/${election._id}`} className="btn btn-primary btn-sm">Vote Now</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-section dashboard-section--full" style={{ marginBottom: 24 }}>
        <h2>Ongoing Elections</h2>
        {activeElections.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <h3>No active elections</h3>
            <p>There are no elections currently in progress.</p>
          </div>
        ) : (
          <div className="election-cards">
            {activeElections.map(election => (
              <div key={election._id} className="active-election-card">
                <div className="election-card-glow" />
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3>{election.title}</h3>
                    <span className="badge badge-success">Active</span>
                    <span className="badge badge-primary" style={{ marginLeft: 8 }}>{election.instanceType}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {timeRemaining(election.endTime)}
                  </span>
                </div>
                <p>{election.description}</p>
                <div className="election-card-meta">
                  <span>Ends: {formatDate(election.endTime)}</span>
                  <span>{election.candidates?.length || 0} candidates</span>
                  <span>{election.totalVotes || 0} votes cast</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link to={`/elections/${election._id}`} className="btn btn-outline btn-sm">View Details</Link>
                  <Link to={`/vote/${election._id}`} className="btn btn-primary btn-sm">Vote Now</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {upcomingElections.length > 0 && (
        <div className="dashboard-section dashboard-section--full" style={{ marginBottom: 24 }}>
          <h2>Upcoming Elections</h2>
          <div className="election-cards">
            {upcomingElections.map(election => (
              <div key={election._id} className="active-election-card" style={{ opacity: 0.7 }}>
                <div className="election-card-glow" />
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3>{election.title}</h3>
                    <span className="badge badge-warning">Pending</span>
                    <span className="badge badge-primary" style={{ marginLeft: 8 }}>{election.instanceType}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Starts {formatDate(election.startTime)}
                  </span>
                </div>
                <p>{election.description}</p>
                <div className="election-card-meta">
                  <span>Starts: {formatDate(election.startTime)}</span>
                  <span>{election.candidates?.length || 0} candidates</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link to={`/elections/${election._id}`} className="btn btn-outline btn-sm">View Details</Link>
                  {(election.status === 'pending' && (!election.nominationDeadline || new Date(election.nominationDeadline) > now)) && (
                    <Link to={`/elections/${election._id}/nominate`} className="btn btn-primary btn-sm">Stand as Candidate</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="alert alert-error mt-3">{error}</div>}
    </div>
  )
}
