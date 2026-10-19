import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Shell from '../../components/layout/Shell'
import { createPost } from '../../services/postService'

const CATEGORIES = [
  { value: 'Electronics', label: '📱 Electronics' },
  { value: 'Bags & Accessories', label: '🎒 Bags & Accessories' },
  { value: 'Books & Study Materials', label: '📚 Books & Study Materials' },
  { value: 'ID & Documents', label: '🪪 ID & Documents' },
  { value: 'Keys', label: '🔑 Keys' },
  { value: 'Clothing', label: '👕 Clothing' },
  { value: 'Personal Items', label: '💧 Personal Items' },
  { value: 'Sports Equipment', label: '⚽ Sports Equipment' },
  { value: 'Jewelry & Accessories', label: '💍 Jewelry & Accessories' },
  { value: 'Other', label: '🧰 Other' },
]

export default function PostForm() {
  const type = new URLSearchParams(useLocation().search).get('type') || 'LOST'
  const navigate = useNavigate()
  const [form, setForm] = useState({ type, title: '', description: '', category: '', location: '', event_date: new Date().toISOString().slice(0, 10), additional_info: '' })
  const [error, setError] = useState('')

  const update = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    try { await createPost(form); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.message || 'Unable to create post') }
  }

  return <Shell><div className="form-page">
    <p className="eyebrow">Share with campus</p>
    <h1>Report an item</h1>
    <div className="type-switch">
      <button className={form.type === 'LOST' ? 'selected' : ''} onClick={() => setForm({ ...form, type: 'LOST' })}>I lost something</button>
      <button className={form.type === 'FOUND' ? 'selected found-selected' : ''} onClick={() => setForm({ ...form, type: 'FOUND' })}>I found something</button>
    </div>
    {error && <div className="error-message">{error}</div>}
    <form className="post-form" onSubmit={submit}>
      <label>Title<input name="title" value={form.title} onChange={update} placeholder="Black leather wallet" required /></label>
      <label>Category
        <select name="category" value={form.category} onChange={update} required>
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
        </select>
      </label>
      <label>Location<input name="location" value={form.location} onChange={update} placeholder="Central Library" required /></label>
      <label>Date {form.type === 'LOST' ? 'lost' : 'found'}<input type="date" name="event_date" value={form.event_date} onChange={update} required /></label>
      <label>Description<textarea name="description" value={form.description} onChange={update} placeholder="Add details that could help someone identify it" required /></label>
      <label>Additional information <span className="optional">Optional</span><textarea name="additional_info" value={form.additional_info} onChange={update} placeholder="Distinctive marks, contents, or where to contact you" /></label>
      <button className="primary-button">Publish report</button>
    </form>
  </div></Shell>
}
