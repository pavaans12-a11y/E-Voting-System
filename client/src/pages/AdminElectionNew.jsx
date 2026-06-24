import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminElectionNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    instanceType: 'educational',
    startTime: '',
    endTime: '',
    nominationDeadline: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.startTime || !form.endTime) {
      setError('Title, start time, and end time are required')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/elections', form)
      navigate(`/admin/elections`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create election')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Link to="/admin/elections" className="btn btn-outline btn-sm mb-3">&larr; Back to Elections</Link>

      <div className="card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24 }}>Create New Election</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Election title" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Describe the election" rows={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Instance Type</label>
            <select className="form-select" name="instanceType" value={form.instanceType} onChange={handleChange}>
              <option value="educational">Educational</option>
              <option value="government">Government</option>
              <option value="local">Local</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input className="form-input" type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input className="form-input" type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nomination Deadline</label>
            <input className="form-input" type="datetime-local" name="nominationDeadline" value={form.nominationDeadline} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
            {submitting ? <span className="spinner spinner-sm"></span> : 'Create Election'}
          </button>
        </form>
      </div>
    </div>
  )
}
