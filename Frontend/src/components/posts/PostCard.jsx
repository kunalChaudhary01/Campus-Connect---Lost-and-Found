import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  return <Link className="post-card" to={`/posts/${post.id}`}><div className="post-card-top"><span className={`type-pill ${post.type.toLowerCase()}`}>{post.type}</span><span className="post-date">{new Date(post.event_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div><h3>{post.title}</h3><p>{post.description}</p><div className="post-card-meta"><span>{post.category}</span><span>{post.location}</span></div></Link>
}
