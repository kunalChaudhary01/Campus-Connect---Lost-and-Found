import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/auth/AuthPage'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/profile/Profile'
import PostForm from './pages/posts/PostForm'
import PostDetails from './pages/posts/PostDetails'
import Requests from './pages/requests/Requests'
import Chat from './pages/chat/Chat'
import Notifications from './pages/notifications/Notifications'
import ProtectedRoute from './routes/ProtectedRoute'

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage mode="login" />} />
    <Route path="/register" element={<AuthPage mode="register" />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/posts/new" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
    <Route path="/posts/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
    <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
}
