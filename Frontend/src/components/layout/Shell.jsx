import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Shell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = async () => {
    await logout()
    navigate('/login')
  }

  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/dashboard"><span className="brand-mark">CC</span><span>Campus Connect</span></Link>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/requests">Requests</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/profile">Profile</Link>
        {user ? <button className="text-button" onClick={signOut}>Log out</button> : <Link to="/login">Sign in</Link>}
      </nav>
    </header>
    <main>{children}</main>
  </div>
}
