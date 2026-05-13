import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Review {
  id: number
  content: string
  rating: number
  likes_count: number
  target_type: string
  target_id: number
  created_at: string
  user?: { full_name: string; email: string }
}

const TABS = [
  { key: 'place', label: '🏙️ Places',    desc: 'Reviews about destinations & attractions' },
  { key: 'food',  label: '🍜 Food',       desc: 'Reviews about restaurants & local cuisine' },
  { key: 'news',  label: '📰 News',       desc: 'Latest travel news & tips' },
]

export default function ReviewsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('place')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const isLoggedIn = !!localStorage.getItem('token')

  // Write review state
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const fetchReviews = async (type: string) => {
    setLoading(true)
    try {
      const res = await api.get(`/reviews?target_type=${type}`)
      setReviews(res.data.reviews || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(activeTab)
    setShowForm(false)
    setMsg('')
  }, [activeTab])

  const handleLike = async (reviewId: number) => {
    if (!isLoggedIn) { navigate('/login'); return }
    await api.post(`/reviews/${reviewId}/like`)
    fetchReviews(activeTab)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    setSubmitting(true)
    try {
      await api.post('/reviews/', {
        target_type: activeTab,
        target_id: 0, // generic, not tied to a specific entity
        content,
        rating,
      })
      setContent(''); setRating(5); setShowForm(false)
      setMsg('✅ Review posted!')
      fetchReviews(activeTab)
    } catch (err: any) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to post'))
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/tours" className="text-indigo-700 font-bold text-xl">🌏 SUN Booking</Link>
          <div className="flex gap-4 items-center">
            {isLoggedIn ? (
              <>
                <Link to="/user/dashboard" className="text-sm text-gray-500 hover:text-indigo-600">My Account</Link>
                <button
                  onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg"
                >Logout</button>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Community Reviews</h1>
        <p className="text-white/70 text-lg">Discover places, food, and travel tips shared by our community</p>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition border-2 ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-700 font-semibold">
              {TABS.find(t => t.key === activeTab)?.desc}
            </p>
            <p className="text-gray-400 text-sm mt-0.5">
              {reviews.length} reviews
              {avgRating && <span className="ml-2 text-yellow-500">★ {avgRating} avg</span>}
            </p>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
            >
              {showForm ? 'Cancel' : '+ Write Review'}
            </button>
          ) : (
            <Link to="/login" className="border border-indigo-400 text-indigo-600 hover:bg-indigo-50 text-sm px-4 py-2.5 rounded-xl transition">
              Sign in to review
            </Link>
          )}
        </div>

        {/* Write review form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Write a {TABS.find(t => t.key === activeTab)?.label} Review
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star rating */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star} type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    </button>
                  ))}
                  <span className="self-center text-sm text-gray-400 ml-2">{rating} / 5</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Your Review</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={`Share your thoughts about ${activeTab === 'place' ? 'this destination' : activeTab === 'food' ? 'local cuisine' : 'travel tips'}...`}
                  rows={4}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              {msg && <p className="text-sm">{msg}</p>}
              <button
                type="submit" disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition"
              >
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          </div>
        )}

        {msg && !showForm && <p className="text-sm mb-4 text-center">{msg}</p>}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {(r.user?.full_name || r.user?.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{r.user?.full_name || r.user?.email}</p>
                      <div className="text-yellow-400 text-sm">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>
                </div>

                <p className="text-gray-600 leading-relaxed">{r.content}</p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleLike(r.id)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition"
                  >
                    ❤️ <span>{r.likes_count} {r.likes_count === 1 ? 'like' : 'likes'}</span>
                  </button>
                  <Link
                    to={`/tours`}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500 transition"
                  >
                    🗺️ Browse Tours
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
