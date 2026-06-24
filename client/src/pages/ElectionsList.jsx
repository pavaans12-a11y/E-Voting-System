import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import TiltCard from '../components/TiltCard'

const TABS = ['All', 'Government', 'Educational', 'Local']

export default function ElectionsList() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    const fetchElections = async () => {
      setLoading(true)
      setError('')
      try {
        const params = activeTab !== 'All' ? { instanceType: activeTab.toLowerCase() } : {}
        const res = await api.get('/elections', { params })
        setElections(res.data.data || [])
      } catch (err) {
        setError('Failed to load elections')
      } finally {
        setLoading(false)
      }
    }
    fetchElections()
  }, [activeTab])

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge badge-warning',
      active: 'badge badge-success',
      completed: 'badge badge-primary',
      cancelled: 'badge badge-danger',
    }
    return <span className={map[status] || 'badge badge-secondary'}>{status}</span>
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="page-header">
        <h1>Elections</h1>
      </div>

      <div className="filter-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && elections.length === 0 && (
        <div className="empty-state">
          <h3>No elections found</h3>
          <p>There are no elections available at the moment.</p>
        </div>
      )}

      {!loading && elections.length > 0 && (
        <div className="grid grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {elections.map((election) => (
            <TiltCard key={election._id} className="election-card">
              <div className="election-card-header">
                <h3>{election.title}</h3>
                <span className="badge badge-primary">{election.instanceType}</span>
              </div>
              {getStatusBadge(election.status)}
              <div className="election-meta">
                <span>{formatDate(election.startTime)} - {formatDate(election.endTime)}</span>
                <span>{election.eligibleVoters?.length || 0} voters</span>
                <span>{election.candidates?.length || 0} candidates</span>
              </div>
              <div className="mt-2">
                <Link to={`/elections/${election._id}`} className="btn btn-outline btn-sm">
                  View Details
                </Link>
              </div>
            </TiltCard>
          ))}
        </div>
      )}
    </div>
  )
}
