import { useEffect, useRef, useState } from 'react'
import Shell from '../../components/layout/Shell'
import { useAuth } from '../../context/AuthContext'
import { getConversations, getMessages, sendMessage } from '../../services/chatService'

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    getConversations()
      .then(({ data }) => {
        const convos = data.data.conversations
        setConversations(convos)
        if (convos.length > 0 && !activeId) setActiveId(convos[0].id)
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [])

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeId) return
    const loadMessages = () => {
      getMessages(activeId)
        .then(({ data }) => setMessages(data.data.messages))
        .catch(() => setMessages([]))
    }
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [activeId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !activeId || sending) return
    setSending(true)
    try {
      await sendMessage(activeId, text.trim())
      setText('')
      const { data } = await getMessages(activeId)
      setMessages(data.data.messages)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeConvo = conversations.find(c => c.id === activeId)

  return <Shell><div className="chat-page">
    {loading && <div className="loading-screen">Loading conversations...</div>}

    {!loading && conversations.length === 0 && (
      <div className="empty-board">
        <div className="empty-icon">💬</div>
        <h3>No conversations yet</h3>
        <p>Conversations are created when a request is approved. Find a FOUND item and send a request to get started.</p>
      </div>
    )}

    {!loading && conversations.length > 0 && (
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <h3>Conversations</h3>
          <div className="convo-list">
            {conversations.map(convo => (
              <button
                key={convo.id}
                className={`convo-item ${convo.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(convo.id)}
              >
                <strong>{convo.post_title || 'Item conversation'}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-main">
          <div className="chat-header">
            <h3>{activeConvo?.post_title || 'Conversation'}</h3>
          </div>

          <div className="message-thread">
            {messages.length === 0 && (
              <p className="muted chat-empty">No messages yet. Say hello!</p>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message-bubble ${msg.sender_id === user?.id ? 'own' : 'other'}`}
              >
                <span className="message-sender">{msg.sender_name}</span>
                <p>{msg.message}</p>
                <span className="message-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-bar">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
            />
            <button className="primary-button" onClick={handleSend} disabled={!text.trim() || sending}>
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </section>
      </div>
    )}
  </div></Shell>
}
