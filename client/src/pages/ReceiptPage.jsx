import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'

export default function ReceiptPage() {
  const { token } = useParams()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/votes/receipt/${token}`)
      .then(res => setReceipt(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Receipt not found'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>

  return (
    <div className="page-container">
      <div className="form-card receipt-card">
        {error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            <div className="receipt-header">
              <div className="receipt-icon">&#10003;</div>
              <h1>Vote Recorded Successfully</h1>
            </div>
            <div className="receipt-details">
              <div className="receipt-row">
                <strong>Receipt Token:</strong>
                <code className="receipt-token">{receipt.receiptToken}</code>
              </div>
              <div className="receipt-row">
                <strong>Election:</strong>
                <span>{receipt.election?.title || 'N/A'}</span>
              </div>
              <div className="receipt-row">
                <strong>Date:</strong>
                <span>{new Date(receipt.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <p className="receipt-note">
              Save this receipt token to verify your vote was counted correctly.
              This is the only proof of your vote.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
