import Shell from '../../components/layout/Shell'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Profile() { const { user } = useAuth(); return <Shell><div className="profile-page"><p className="eyebrow">Your profile</p>{user ? <><h1>{user.name}</h1><div className="profile-grid"><div><span>Email</span><strong>{user.email}</strong></div><div><span>College</span><strong>{user.college}</strong></div><div><span>Student ID</span><strong>{user.student_id}</strong></div><div><span>Role</span><strong>{user.role}</strong></div></div></> : <><h1>Profile access</h1><p className="muted">Sign in to view and manage your profile.</p><Link className="primary-button compact" to="/login">Sign in</Link></>}</div></Shell> }
