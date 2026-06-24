import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await api.put('/auth/profile', form)
      setUser(res.data.data)
      setEditing(false)
      setMessage('Profile updated successfully')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="page-container">
      <div className="profile-card card">
        <div className="profile-header">
          <img
            src={user.photo || 'https://via.placeholder.com/96'}
            alt={user.name}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2>{user.name}</h2>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-detail">
              <span className="profile-detail-label">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="profile-detail">
              <span className="profile-detail-label">Phone</span>
              <span>{user.phone || 'Not set'}</span>
            </div>
            <div className="profile-detail">
              <span className="profile-detail-label">Role</span>
              <span className="badge">{user.role}</span>
            </div>
            <div className="profile-detail">
              <span className="profile-detail-label">Verified</span>
              <span>{user.isVerified ? 'Yes' : 'No'}</span>
            </div>
            <div className="profile-detail">
              <span className="profile-detail-label">Member Since</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <button className="btn btn-primary mt-3" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
