import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function MyNominations() {
  const [nominations, setNominations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/nominations/my')
      .then(res => setNominations(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>

  return (
    <div className="page-container">
      <h1>My Nominations</h1>
      {nominations.length === 0 ? (
        <div className="empty-state">
          <p>You haven't submitted any nominations yet.</p>
          <Link to="/elections" className="btn btn-primary">Browse Elections</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Election</th>
                <th>Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {nominations.map(nom => (
                <tr key={nom._id}>
                  <td>{nom.election?.title || 'Unknown'}</td>
                  <td><span className="badge">{nom.election?.instanceType}</span></td>
                  <td>
                    <span className={`badge badge-${nom.status}`}>{nom.status}</span>
                  </td>
                  <td>{new Date(nom.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/elections/${nom.election?._id}`} className="btn btn-sm btn-outline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
