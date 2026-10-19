import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Shell from '../../components/layout/Shell'
import PostCard from '../../components/posts/PostCard'
import { getPosts } from '../../services/postService'

export default function Dashboard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce: wait 400ms after the user stops typing before firing the API call
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    getPosts({ search: debouncedSearch }).then(({ data }) => setPosts(data.data.posts)).catch(() => setPosts([]))
  }, [debouncedSearch])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return <Shell><div className="dashboard-page">
    <section className="welcome-block">
      <div>
        <p className="eyebrow">{today}</p>
        <h1>{user ? `Good to see you, ${user.name.split(' ')[0]}.` : 'Find what matters on campus.'}</h1>
        <p className="muted">A small report can make a big difference on campus.</p>
      </div>
      <div className="quick-actions">
        <Link className="action-button action-lost" to="/posts/new?type=LOST"><span>+</span> Report lost</Link>
        <Link className="action-button action-found" to="/posts/new?type=FOUND"><span>+</span> Report found</Link>
      </div>
    </section>
    <section className="feed-header">
      <div>
        <p className="eyebrow">Community board</p>
        <h2>Recent reports</h2>
      </div>
      <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reports" />
    </section>
    {posts.length
      ? <div className="post-grid">{posts.map(post => <PostCard key={post.id} post={post} />)}</div>
      : <div className="empty-board">
          <div className="empty-icon">⌁</div>
          <h3>Your campus board is ready</h3>
          <p>New lost and found reports will appear here. Start by sharing an item with your community.</p>
          <Link className="primary-button compact" to="/posts/new?type=LOST">Create first report</Link>
        </div>
    }
  </div></Shell>
}
