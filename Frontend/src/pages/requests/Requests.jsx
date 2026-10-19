import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import { useAuth } from '../../context/AuthContext'
import { getRequests, decideRequest } from '../../services/requestService'

export default function Requests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    getRequests()
      .then(({ data }) => setRequests(data.data.requests))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDecision = async (id, action) => {
    try {
      await decideRequest(id, action)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    }
  }

  const received = requests.filter(r => r.owner_id === user?.id)
  const sent = requests.filter(r => r.requester_id === user?.id)

  return <Shell><div className="requests-page">
    <p className="eyebrow">Item requests</p>
    <h1>Your requests</h1>

    {loading && <div className="loading-screen">Loading requests...</div>}

    {!loading && <>
      <section className="requests-section">
        <h2>Received</h2>
        {received.length === 0
          ? <p className="muted">No incoming requests yet.</p>
          : <div className="requests-list">
              {received.map(req => (
                <div className="request-card" key={req.id}>
                  <div className="request-card-top">
                    <Link className="request-post-link" to={`/posts/${req.post_id}`}>{req.post_title || 'View post'}</Link>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>{req.status}</span>
                  </div>
                  <p className="request-message">"{req.message}"</p>
                  <div className="request-card-meta">
                    <span>Received {new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                  {req.status === 'PENDING' && (
                    <div className="request-actions">
                      <button className="primary-button compact" onClick={() => handleDecision(req.id, 'approve')}>Approve</button>
                      <button className="reject-button compact" onClick={() => handleDecision(req.id, 'reject')}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
        }
      </section>

      <section className="requests-section">
        <h2>Sent</h2>
        {sent.length === 0
          ? <p className="muted">You haven't sent any requests yet.</p>
          : <div className="requests-list">
              {sent.map(req => (
                <div className="request-card" key={req.id}>
                  <div className="request-card-top">
                    <Link className="request-post-link" to={`/posts/${req.post_id}`}>{req.post_title || 'View post'}</Link>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>{req.status}</span>
                  </div>
                  <p className="request-message">"{req.message}"</p>
                  <div className="request-card-meta">
                    <span>Sent {new Date(req.created_at).toLocaleDateString()}</span>
                    {req.status === 'APPROVED' && <Link className="chat-link" to="/chat">Open chat →</Link>}
                  </div>
                </div>
              ))}
            </div>
        }
      </section>
    </>}
  </div></Shell>
}
