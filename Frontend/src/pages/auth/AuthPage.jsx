import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', student_id: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true)
    try { await (isRegister ? register(form) : login({ email: form.email, password: form.password })); navigate('/dashboard', { replace: true }) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Something went wrong. Please try again.') }
    finally { setSubmitting(false) }
  }

  return <div className="auth-layout">
    <section className="auth-intro"><p className="eyebrow">Your campus, connected</p><h1>Help lost things find their way home.</h1><p>Campus Connect brings lost and found reports, thoughtful requests, and trusted conversations into one student-friendly space.</p><div className="intro-note"><span>01</span><strong>Report it.</strong><span>02</span><strong>Match it.</strong><span>03</span><strong>Return it.</strong></div></section>
    <section className="auth-card"><p className="eyebrow">Campus Connect</p><h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2><p className="muted">{isRegister ? 'Join your campus lost and found network.' : 'Sign in to continue helping items get home.'}</p>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={submit}>
        {isRegister && <><label>Name<input name="name" value={form.name} onChange={update} placeholder="Your full name" required /></label><label>College / University<input name="college" value={form.college} onChange={update} placeholder="Your institution" required /></label><label>Student ID<input name="student_id" value={form.student_id} onChange={update} placeholder="Enrollment number" required /></label></>}
        <label>Email<input type="email" name="email" value={form.email} onChange={update} placeholder="you@college.edu" required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={update} placeholder="At least 8 characters" required /></label>
        <button className="primary-button" disabled={submitting}>{submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}</button>
      </form><p className="switch-copy">{isRegister ? 'Already a member?' : 'New to Campus Connect?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
    </section>
  </div>
}
