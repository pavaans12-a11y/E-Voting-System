import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [electionFilter, setElectionFilter] = useState('')
  const [elections, setElections] = useState([])

  useEffect(() => {
    api.get('/elections').then(res => setElections(res.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (electionFilter) params.electionId = electionFilter
    api.get('/admin/audit-logs', { params })
      .then(res => {
        setLogs(res.data.data.logs || [])
        setTotalPages(res.data.data.pagination?.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, electionFilter])

  return (
    <div className="page-container">
      <h1>Audit Logs</h1>

      <div className="filter-bar">
        <select value={electionFilter} onChange={(e) => { setElectionFilter(e.target.value); setPage(1) }}>
          <option value="">All Elections</option>
          {elections.map(e => (
            <option key={e._id} value={e._id}>{e.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Election</th>
                  <th>Description</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><span className="badge">{log.action}</span></td>
                    <td>{log.actor?.name || log.actor?.email || 'System'}</td>
                    <td>{log.election?.title || 'N/A'}</td>
                    <td>{log.description}</td>
                    <td><code>{log.ip || 'N/A'}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <p className="text-muted">No audit logs found</p>}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
