import { useEffect, useState } from 'react'
import Shell from '../../components/layout/Shell'
import { useAuth } from '../../context/AuthContext'
import { getNotifications, markAsRead } from '../../services/notificationService'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    getNotifications()
      .then(({ data }) => setNotifications(data.data.notifications))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id)
      load()
    } catch {}
  }

  const unread = notifications.filter(n => !n.is_read)
  const read = notifications.filter(n => n.is_read)

  return <Shell><div className="notifications-page">
    <p className="eyebrow">Stay updated</p>
    <h1>Notifications</h1>

    {loading && <div className="loading-screen">Loading notifications...</div>}

    {!loading && notifications.length === 0 && (
      <div className="empty-board">
        <div className="empty-icon">🔔</div>
        <h3>No notifications yet</h3>
        <p>You'll receive notifications when someone requests your item, approves your request, or sends you a message.</p>
      </div>
    )}

    {!loading && unread.length > 0 && (
      <section className="notifications-section">
        <h2>New</h2>
        <div className="notifications-list">
          {unread.map(n => (
            <div className="notification-card unread" key={n.id}>
              <div className="notification-dot" />
              <div className="notification-content">
                <p>{n.message}</p>
                <span className="notification-time">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <button className="text-button" onClick={() => handleMarkRead(n.id)}>Mark read</button>
            </div>
          ))}
        </div>
      </section>
    )}

    {!loading && read.length > 0 && (
      <section className="notifications-section">
        <h2>Earlier</h2>
        <div className="notifications-list">
          {read.map(n => (
            <div className="notification-card" key={n.id}>
              <div className="notification-content">
                <p>{n.message}</p>
                <span className="notification-time">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}
  </div></Shell>
}
