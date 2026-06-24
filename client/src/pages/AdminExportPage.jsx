import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminExportPage() {
  const { id } = useParams()
  const [election, setElection] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [format, setFormat] = useState('csv')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, rRes] = await Promise.all([
          api.get(`/elections/${id}`),
          api.get(`/votes/results/${id}`),
        ])
        setElection(eRes.data.data)
        setResults(rRes.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get(`/admin/export/${id}?format=${format}`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${election?.title || 'results'}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Export failed. The server may not support this format yet.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="spinner-container"><div className="spinner"></div></div>
  }

  if (error && !results) {
    return <div className="alert alert-error">{error}</div>
  }

  const sorted = [...(results?.results || [])].sort((a, b) => b.votes - a.votes)
  const totalVotes = sorted.reduce((sum, r) => sum + r.votes, 0)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Link to={`/admin/results/${id}`} className="btn btn-outline btn-sm mb-3">&larr; Back to Results</Link>

      <div className="card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24 }}>Export Results</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card mb-4">
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{election?.title}</h3>
          <p className="text-muted">Total votes: {totalVotes}</p>
        </div>

        <div className="form-group">
          <label className="form-label">Export Format</label>
          <div className="flex gap-2">
            <button
              className={`btn ${format === 'csv' ? 'btn-primary' : 'btn-outline'} btn-lg`}
              style={{ flex: 1 }}
              onClick={() => setFormat('csv')}
            >
              CSV
            </button>
            <button
              className={`btn ${format === 'pdf' ? 'btn-primary' : 'btn-outline'} btn-lg`}
              style={{ flex: 1 }}
              onClick={() => setFormat('pdf')}
            >
              PDF
            </button>
          </div>
        </div>

        <div className="card" style={{ background: 'rgba(255,255,255,0.02)', marginBottom: 24 }}>
          <div className="card-header">
            <h4 className="card-title">Preview</h4>
          </div>
          {sorted.map((r, i) => (
            <div key={i} className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
              <span>{r.candidate?.name || 'Unknown'}</span>
              <span className="text-muted">{r.votes} votes</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-lg btn-block" onClick={handleExport} disabled={exporting}>
          {exporting ? <span className="spinner spinner-sm"></span> : `Download as ${format.toUpperCase()}`}
        </button>
      </div>
    </div>
  )
}
