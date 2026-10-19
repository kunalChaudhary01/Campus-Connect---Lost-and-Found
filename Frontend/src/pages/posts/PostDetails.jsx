import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import { useAuth } from '../../context/AuthContext'
import { getPost, resolvePost, deletePost } from '../../services/postService'
import { createRequest, getRequests } from '../../services/requestService'

export default function PostDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [message, setMessage] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [notice, setNotice] = useState('')
  const [existingRequest, setExistingRequest] = useState(null)
  const [confirming, setConfirming] = useState(null) // 'resolve' | 'delete' | null

  useEffect(() => {
    getPost(id).then(({ data }) => setPost(data.data.post))
  }, [id])

  // Check if the current user already has a request for this post
  useEffect(() => {
    if (!user || !post) return
    getRequests()
      .then(({ data }) => {
        const match = data.data.requests.find(r => r.post_id === post.id && r.requester_id === user.id)
        if (match) setExistingRequest(match)
      })
      .catch(() => {})
  }, [user, post])

  if (!post) return <Shell><div className="loading-screen">Loading report...</div></Shell>

  const sendRequest = async () => {
    try {
      await createRequest({ post_id: post.id, message })
      setNotice('Request sent. The finder will be notified.')
      setRequesting(false)
      getRequests()
        .then(({ data }) => {
          const match = data.data.requests.find(r => r.post_id === post.id && r.requester_id === user?.id)
          if (match) setExistingRequest(match)
        })
        .catch(() => {})
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to send request')
    }
  }

  const handleResolve = async () => {
    try {
      const { data } = await resolvePost(post.id)
      setPost(data.data.post)
      setNotice('Post marked as resolved! The item has been returned.')
      setConfirming(null)
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to resolve post')
    }
  }

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      navigate('/dashboard')
    } catch (error) {
      setNotice(error.response?.data?.message || 'Unable to delete post')
    }
  }

  const isOwner = user && post.owner && post.owner.id === user.id
  const hasOwner = post.owner && post.owner.id
  const canRequest = post.status === 'ACTIVE' && !isOwner && hasOwner && !existingRequest

  const isLost = post.type === 'LOST'
  const requestButtonLabel = isLost ? 'I think I found this item' : 'I think this is my item'
  const requestTextareaLabel = isLost ? 'Tell the owner where and when you found it' : 'Tell the finder why you think this is yours'
  const requestPlaceholder = isLost ? 'Describe where you found it and any identifying details' : 'Share identifying details'

  return <Shell><div className="details-page">
    <Link className="back-link" to="/dashboard">← Back to board</Link>
    <div className="details-header">
      <span className={`type-pill ${post.type.toLowerCase()}`}>{post.type}</span>
      <span className={`status-label ${post.status === 'RESOLVED' ? 'resolved' : ''}`}>{post.status}</span>
    </div>
    <h1>{post.title}</h1>
    <p className="details-description">{post.description}</p>
    <div className="details-grid">
      <div><span>Category</span><strong>{post.category}</strong></div>
      <div><span>Location</span><strong>{post.location}</strong></div>
      <div><span>Date</span><strong>{new Date(post.event_date + 'T00:00:00').toLocaleDateString()}</strong></div>
      <div><span>Reported by</span><strong>{post.owner.name}</strong></div>
    </div>
    {post.additional_info && <div className="additional-info"><span>Additional information</span><p>{post.additional_info}</p></div>}

    {/* Resolved banner */}
    {post.status === 'RESOLVED' && <div className="resolved-banner">✅ This item has been resolved — it was successfully returned to its owner.</div>}

    {/* Owner actions */}
    {isOwner && post.status === 'ACTIVE' && !confirming && (
      <div className="owner-actions">
        <button className="resolve-button" onClick={() => setConfirming('resolve')}>✅ Mark as resolved</button>
        <button className="delete-button" onClick={() => setConfirming('delete')}>🗑️ Delete post</button>
      </div>
    )}

    {/* Confirmation dialogs */}
    {confirming === 'resolve' && (
      <div className="confirm-box">
        <p><strong>Mark this post as resolved?</strong></p>
        <p className="muted">This means the item has been successfully returned to its owner. The post will remain visible but marked as resolved.</p>
        <div className="confirm-actions">
          <button className="resolve-button" onClick={handleResolve}>Yes, mark as resolved</button>
          <button className="reject-button" onClick={() => setConfirming(null)}>Cancel</button>
        </div>
      </div>
    )}

    {confirming === 'delete' && (
      <div className="confirm-box danger">
        <p><strong>Delete this post permanently?</strong></p>
        <p className="muted">This action cannot be undone. The post and all associated data will be removed.</p>
        <div className="confirm-actions">
          <button className="delete-button" onClick={handleDelete}>Yes, delete post</button>
          <button className="reject-button" onClick={() => setConfirming(null)}>Cancel</button>
        </div>
      </div>
    )}

    {existingRequest && <div className="additional-info">Your request is <strong>{existingRequest.status.toLowerCase()}</strong>.{existingRequest.status === 'APPROVED' && <> <Link className="chat-link" to="/chat">Open chat →</Link></>}</div>}
    {notice && <div className="additional-info">{notice}</div>}
    {canRequest && !requesting && <button className="primary-button" onClick={() => setRequesting(true)}>{requestButtonLabel}</button>}
    {requesting && <div className="request-box">
      <label>{requestTextareaLabel}
        <textarea value={message} onChange={event => setMessage(event.target.value)} placeholder={requestPlaceholder} />
      </label>
      <button className="primary-button" onClick={sendRequest} disabled={!message.trim()}>Send request</button>
    </div>}
  </div></Shell>
}
