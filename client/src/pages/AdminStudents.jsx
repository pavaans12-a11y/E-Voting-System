import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function AdminStudents() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, role: newRole } : u
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role')
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>

  return (
    <div>
      <div className="page-header">
        <h1>Manage Voters</h1>
      </div>

      <div className="mb-4">
        <input
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id}>
                <td>
                  <div className="flex items-center gap-2">
                    {u.photo && <img src={u.photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
                    {u.name}
                  </div>
                </td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>{u.isVerified ? 'Yes' : 'No'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="actions-cell">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="form-select"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      <option value="voter">Voter</option>
                      <option value="auditor">Auditor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-muted p-3" style={{ textAlign: 'center' }}>No voters found</p>}
      </div>
    </div>
  )
}
