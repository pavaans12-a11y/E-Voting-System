import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminCandidates() {
  const [elections, setElections] = useState([])
  const [users, setUsers] = useState([])
  const [selectedElection, setSelectedElection] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/elections'),
      api.get('/admin/users'),
    ]).then(([eRes, uRes]) => {
      setElections(eRes.data.data || [])
      setUsers(uRes.data.data || [])
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  const election = elections.find(e => e._id === selectedElection)
  const candidateIds = new Set((election?.candidates || []).map(c => c._id || c))
  const nonCandidateUsers = users.filter(u =>
    !candidateIds.has(u._id) &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  )

  const addCandidate = async (userId) => {
    try {
      await api.post(`/elections/${selectedElection}/candidates`, { userId })
      setMessage('Candidate added')
      const res = await api.get('/elections')
      setElections(res.data.data || [])
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add candidate')
    }
  }

  const removeCandidate = async (userId) => {
    try {
      await api.delete(`/elections/${selectedElection}/candidates/${userId}`)
      setMessage('Candidate removed')
      const res = await api.get('/elections')
      setElections(res.data.data || [])
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to remove candidate')
    }
  }

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Manage Candidates</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="card mb-4">
        <div className="form-group">
          <label className="form-label">Select Election</label>
          <select className="form-select" value={selectedElection} onChange={e => { setSelectedElection(e.target.value); setMessage('') }}>
            <option value="">-- Choose an election --</option>
            {elections.filter(e => e.status === 'pending').map(e => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {election && (
        <>
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Current Candidates ({election.candidates?.length || 0})</h3>
            </div>
            {(election.candidates || []).length === 0 ? (
              <p className="text-muted">No candidates yet</p>
            ) : (
              <div className="grid" style={{ gap: 8 }}>
                {election.candidates.map(c => {
                  const cId = c._id || c
                  const user = users.find(u => u._id === cId)
                  return (
                    <div key={cId} className="flex justify-between items-center p-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span>{user?.name || cId} {user?.email ? `(${user.email})` : ''}</span>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => removeCandidate(cId)}>Remove</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Add Candidate</h3>
            </div>
            <div className="form-group">
              <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {nonCandidateUsers.length === 0 ? (
              <p className="text-muted">No users found</p>
            ) : (
              <div className="grid" style={{ gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {nonCandidateUsers.map(u => (
                  <div key={u._id} className="flex justify-between items-center p-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span>{u.name} ({u.email})</span>
                    <button className="btn btn-primary btn-sm" onClick={() => addCandidate(u._id)}>Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
