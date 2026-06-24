import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

const defaultForm = {
  title: '', description: '', instanceType: 'local',
  startTime: '', endTime: '', nominationDeadline: '',
  eligibleVoters: [],
}

export default function AdminElections() {
  const [elections, setElections] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [voterSearch, setVoterSearch] = useState('')

  const fetchElections = () => {
    api.get('/elections')
      .then(res => setElections(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const fetchUsers = () => {
    api.get('/admin/users')
      .then(res => setUsers(res.data.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    fetchElections()
    fetchUsers()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...defaultForm })
    setVoterSearch('')
    setShowModal(true)
  }

  const openEdit = (election) => {
    setEditing(election)
    setForm({
      title: election.title || '',
      description: election.description || '',
      instanceType: election.instanceType || 'local',
      startTime: election.startTime ? new Date(election.startTime).toISOString().slice(0, 16) : '',
      endTime: election.endTime ? new Date(election.endTime).toISOString().slice(0, 16) : '',
      nominationDeadline: election.nominationDeadline ? new Date(election.nominationDeadline).toISOString().slice(0, 16) : '',
      eligibleVoters: (election.eligibleVoters || []).map(v => typeof v === 'string' ? v : v._id),
    })
    setVoterSearch('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.put(`/elections/${editing._id}`, form)
      } else {
        await api.post('/elections', form)
      }
      setShowModal(false)
      setForm({ ...defaultForm })
      fetchElections()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save election')
    }
  }

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        await api.delete(`/elections/${id}`)
      } else {
        await api.post(`/elections/${id}/${action}`)
      }
      fetchElections()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    }
  }

  const toggleVoter = (userId) => {
    setForm(prev => ({
      ...prev,
      eligibleVoters: prev.eligibleVoters.includes(userId)
        ? prev.eligibleVoters.filter(id => id !== userId)
        : [...prev.eligibleVoters, userId],
    }))
  }

  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false
    const term = voterSearch.toLowerCase()
    return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
  })

  const getStatusActions = (election) => {
    if (election.status === 'pending') {
      return (
        <>
          <button className="btn btn-sm btn-outline" onClick={() => openEdit(election)}>Edit</button>
          <button className="btn btn-sm btn-success" onClick={() => handleAction(election._id, 'start')}>Start</button>
          <button className="btn btn-sm btn-danger" onClick={() => handleAction(election._id, 'delete')}>Cancel</button>
        </>
      )
    }
    if (election.status === 'active') {
      return (
        <>
          <button className="btn btn-sm btn-warning" onClick={() => handleAction(election._id, 'end')}>End</button>
        </>
      )
    }
    if (election.status === 'completed') {
      return (
        <>
          <Link to={`/admin/results/${election._id}`} className="btn btn-sm btn-primary">Results</Link>
        </>
      )
    }
    return <span className="badge">{election.status}</span>
  }

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>

  return (
    <div className="page-container">
      <div className="header-row">
        <h1>Manage Elections</h1>
        <div className="flex gap-2">
          <Link to="/admin/elections/new" className="btn btn-primary">Create Election</Link>
          <Link to="/admin/candidates" className="btn btn-outline">Candidates</Link>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
              <th>Votes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {elections.map(e => (
              <tr key={e._id}>
                <td>{e.title}</td>
                <td><span className={`badge badge-${e.instanceType}`}>{e.instanceType}</span></td>
                <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                <td>{new Date(e.startTime).toLocaleDateString()}</td>
                <td>{new Date(e.endTime).toLocaleDateString()}</td>
                <td>{e.totalVotes || 0}</td>
                <td className="actions-cell">{getStatusActions(e)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Election' : 'Create Election'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
              </div>
              <div className="form-group">
                <label>Instance Type</label>
                <select value={form.instanceType} onChange={e => setForm({...form, instanceType: e.target.value})}>
                  <option value="government">Government</option>
                  <option value="educational">Educational</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Nomination Deadline</label>
                <input type="datetime-local" value={form.nominationDeadline} onChange={e => setForm({...form, nominationDeadline: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Eligible Voters ({form.eligibleVoters.length} selected)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search voters by name or email..."
                  value={voterSearch}
                  onChange={e => setVoterSearch(e.target.value)}
                />
                <div className="voter-list">
                  {filteredUsers.map(u => (
                    <label key={u._id} className="voter-item">
                      <input
                        type="checkbox"
                        checked={form.eligibleVoters.includes(u._id)}
                        onChange={() => toggleVoter(u._id)}
                      />
                      <span>{u.name}</span>
                      <span className="text-muted">({u.email})</span>
                    </label>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-muted">No users found</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Save Changes' : 'Create'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
