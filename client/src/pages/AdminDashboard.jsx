import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [activeElections, setActiveElections] = useState([])
  const [nominations, setNominations] = useState([])
  const [activity, setActivity] = useState({ logs: [], summary: { newUsersToday: 0, newUsersWeek: 0, electionsCreated: 0 } })

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data.data)).catch(() => {})
    api.get('/elections?status=active').then(res => setActiveElections(res.data.data || [])).catch(() => {})
    api.get('/admin/nominations?status=pending').then(res => setNominations(res.data.data || [])).catch(() => {})
    api.get('/admin/recent-activity').then(res => setActivity(res.data.data)).catch(() => {})
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.put(`/nominations/${id}/approve`)
      setNominations(prev => prev.filter(n => n._id !== id))
    } catch {}
  }

  const handleReject = async (id) => {
    try {
      await api.put(`/nominations/${id}/reject`)
      setNominations(prev => prev.filter(n => n._id !== id))
    } catch {}
  }

  return (
    <div className="page-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <p className="text-secondary">Welcome, {user?.name}</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/elections" className="btn btn-primary">Manage Elections</Link>
          <Link to="/admin/students" className="btn btn-outline">Manage Voters</Link>
          <Link to="/admin/candidates" className="btn btn-outline">Manage Candidates</Link>
          <Link to="/admin/audit-logs" className="btn btn-outline">Audit Logs</Link>
        </div>
      </div>

      {stats && (
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card stat-card--users">
              <div className="stat-icon"><UserIcon /></div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Registered Users</div>
            </div>
            <div className="stat-card stat-card--elections">
              <div className="stat-icon"><VoteIcon /></div>
              <div className="stat-value">{stats.totalElections}</div>
              <div className="stat-label">Total Elections</div>
            </div>
            <div className="stat-card stat-card--active">
              <div className="stat-icon"><ActivityIcon /></div>
              <div className="stat-value">{stats.activeElections}</div>
              <div className="stat-label">Active Elections</div>
            </div>
            <div className="stat-card stat-card--votes">
              <div className="stat-icon"><CheckIcon /></div>
              <div className="stat-value">{stats.totalVotes}</div>
              <div className="stat-label">Total Votes Cast</div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Active Elections</h2>
          {activeElections.length === 0 ? (
            <p className="text-muted">No active elections</p>
          ) : (
            <div className="election-cards">
              {activeElections.map(election => (
                <div key={election._id} className="active-election-card">
                  <div className="election-card-glow" />
                  <h3>{election.title}</h3>
                  <span className="badge badge-success">{election.instanceType || 'General'}</span>
                  <p className="text-muted">{election.description?.slice(0, 100)}</p>
                  <div className="election-card-meta">
                    <span>{election.candidates?.length || 0} candidates</span>
                    <span>{election.totalVotes || 0} votes</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Nomination Requests {nominations.length > 0 && <span className="badge badge-warning">{nominations.length}</span>}</h2>
          {nominations.length === 0 ? (
            <p className="text-muted">No pending nomination requests</p>
          ) : (
            <div className="nomination-list">
              {nominations.map(nom => (
                <div key={nom._id} className="nomination-card">
                  <div className="nomination-header">
                    <div className="nomination-avatar">{nom.user?.name?.[0]?.toUpperCase() || '?'}</div>
                    <div>
                      <strong>{nom.user?.name}</strong>
                      <span className="text-muted">{nom.user?.email}</span>
                    </div>
                  </div>
                  <p><strong>Election:</strong> {nom.election?.title}</p>
                  {nom.statement && <p className="nomination-statement">"{nom.statement}"</p>}
                  <div className="nomination-actions">
                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(nom._id)}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(nom._id)}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-section dashboard-section--full">
        <h2>Recent Activity</h2>
        <div className="activity-summary">
          <div className="activity-stat">
            <span className="activity-stat-value">{activity.summary.newUsersToday}</span>
            <span className="activity-stat-label">New Users Today</span>
          </div>
          <div className="activity-stat">
            <span className="activity-stat-value">{activity.summary.newUsersWeek}</span>
            <span className="activity-stat-label">New Users This Week</span>
          </div>
          <div className="activity-stat">
            <span className="activity-stat-value">{activity.summary.electionsCreated}</span>
            <span className="activity-stat-label">Elections Created</span>
          </div>
        </div>
        {activity.logs.length === 0 ? (
          <p className="text-muted">No recent activity</p>
        ) : (
          <div className="activity-feed">
            {activity.logs.map(log => (
              <div key={log._id} className="activity-item">
                <div className="activity-dot" data-type={log.action?.toLowerCase().includes('election') ? 'election' : 'user'} />
                <div className="activity-content">
                  <span className="activity-action">{log.action?.replace(/_/g, ' ').toLowerCase()}</span>
                  <span className="activity-desc">{log.description}</span>
                  <span className="activity-time">{formatTimeAgo(log.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function UserIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function VoteIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg> }
function ActivityIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> }
function CheckIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }