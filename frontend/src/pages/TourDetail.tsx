import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'

interface Tour {
  id: number; title: string; description: string
  price: number; duration: number; location: string
  category?: { name: string }
}

interface Comment {
  id: number; content: string; created_at: string
  user?: { full_name: string; email: string }
  replies?: Comment[]
}

interface Review {
  id: number; content: string; rating: number; likes_count: number
  created_at: string; user?: { full_name: string; email: string }
  comments?: Comment[]
}

export default function TourDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState<Tour | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // Booking state
  const [bookingDate, setBookingDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('internet_banking')
  const [booking, setBooking] = useState(false)
  const [bookingMsg, setBookingMsg] = useState('')

  // Review state
  const [reviewContent, setReviewContent] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)

  // Comment state per review
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [commentsData, setCommentsData] = useState<Record<string, Comment[]>>({})

  const isLoggedIn = !!localStorage.getItem('token')

  const fetchReviews = async () => {
    const res = await api.get(`/reviews?target_type=tour&target_id=${id}`)
    setReviews(res.data.reviews || [])
  }

  useEffect(() => {
    Promise.all([
      api.get(`/tours/${id}`),
      api.get(`/reviews?target_type=tour&target_id=${id}`)
    ]).then(([tourRes, reviewRes]) => {
      setTour(tourRes.data.tour)
      setReviews(reviewRes.data.reviews || [])
    }).finally(() => setLoading(false))
  }, [id])

  const handleBook = async () => {
    if (!isLoggedIn) { navigate('/login'); return }
    if (!bookingDate) { setBookingMsg('Please select a booking date'); return }
    setBooking(true); setBookingMsg('')
    try {
      await api.post('/bookings/', {
        tour_id: Number(id),
        booking_date: new Date(bookingDate).toISOString(),
        payment_method: paymentMethod
      })
      setBookingMsg('✅ Booking created! Go to My Account to complete payment.')
    } catch (err: any) {
      setBookingMsg('❌ ' + (err.response?.data?.error || 'Booking failed'))
    } finally { setBooking(false) }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    setSubmittingReview(true)
    try {
      await api.post('/reviews/', {
        target_type: 'tour', target_id: Number(id),
        content: reviewContent, rating
      })
      setReviewContent(''); setRating(5)
      await fetchReviews()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit review')
    } finally { setSubmittingReview(false) }
  }

  const handleLike = async (reviewId: number) => {
    if (!isLoggedIn) { navigate('/login'); return }
    await api.post(`/reviews/${reviewId}/like`)
    await fetchReviews()
  }

  const toggleComments = async (reviewId: number) => {
    const isOpen = openComments[reviewId]
    setOpenComments(prev => ({ ...prev, [reviewId]: !isOpen }))
    const rKey = String(reviewId)
    if (!isOpen && !commentsData[rKey]) {
      const res = await api.get(`/reviews/${reviewId}/comments`)
      setCommentsData(prev => ({ ...prev, [rKey]: res.data.comments || [] }))
    }
  }

  const handleSubmitComment = async (reviewId: number, parentId?: number) => {
    const key = parentId ? `${reviewId}-${parentId}` : reviewId
    const content = commentInputs[key]
    if (!content?.trim()) return
    await api.post(`/reviews/${reviewId}/comments`, {
      content, parent_comment_id: parentId || null
    })
    setCommentInputs(prev => ({ ...prev, [key]: '' }))
    const res = await api.get(`/reviews/${reviewId}/comments`)
    setCommentsData(prev => ({ ...prev, [String(reviewId)]: res.data.comments || [] }))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!tour) return <div className="min-h-screen flex items-center justify-center text-red-500">Tour not found</div>

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/tours" className="text-indigo-700 font-bold text-xl">← SUN Booking</Link>
          <div className="flex gap-3">
            {isLoggedIn
              ? <Link to="/user/dashboard" className="text-sm text-gray-500 hover:text-indigo-600">My Account</Link>
              : <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg">Sign In</Link>
            }
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Tour Info + Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero image */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl h-64 flex items-center justify-center text-white text-7xl">🗺️</div>

          {/* Tour Info */}
          <div>
            {tour.category && <span className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full">{tour.category.name}</span>}
            <h1 className="text-3xl font-bold text-gray-800 mt-3">{tour.title}</h1>
            <div className="flex flex-wrap gap-5 text-sm text-gray-500 mt-3">
              <span>📍 {tour.location}</span>
              <span>⏱️ {tour.duration} days</span>
              <span className="text-indigo-600 font-bold text-base">${tour.price}</span>
              {avgRating && <span className="text-yellow-500">★ {avgRating} ({reviews.length} reviews)</span>}
            </div>
            <p className="text-gray-600 mt-4 leading-relaxed">{tour.description}</p>
          </div>

          {/* Write Review */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">
              {isLoggedIn ? 'Write a Review' : <span>Want to share your experience? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link></span>}
            </h2>
            {isLoggedIn && (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                {/* Star Rating */}
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
                  <span className="text-sm text-gray-400 ml-2 self-center">{rating}/5</span>
                </div>
                <textarea
                  value={reviewContent}
                  onChange={e => setReviewContent(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  type="submit" disabled={submittingReview}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-xl transition"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm bg-white rounded-2xl p-6 shadow-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    {/* Review Header */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{r.user?.full_name || r.user?.email}</p>
                        <div className="text-yellow-400 text-sm">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{r.content}</p>

                    {/* Like + Comment buttons */}
                    <div className="flex gap-4 mt-3">
                      <button
                        onClick={() => handleLike(r.id)}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition"
                      >
                        ❤️ <span>{r.likes_count}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(r.id)}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500 transition"
                      >
                        💬 <span>{openComments[r.id] ? 'Hide' : 'Comment'}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {openComments[r.id] && (
                      <div className="mt-4 space-y-3 border-t border-gray-50 pt-4">
                        {(commentsData[String(r.id)] || []).map(c => (
                          <div key={c.id} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {(c.user?.full_name || c.user?.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-700">{c.user?.full_name || c.user?.email}</p>
                              <p className="text-sm text-gray-600">{c.content}</p>
                              {/* Replies */}
                              {(c.replies || []).map(reply => (
                                <div key={reply.id} className="flex gap-2 mt-2 ml-4">
                                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                                    {(reply.user?.full_name || '?')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-600">{reply.user?.full_name || reply.user?.email}</p>
                                    <p className="text-xs text-gray-500">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                              {/* Reply input */}
                              {isLoggedIn && (
                                <div className="flex gap-2 mt-2">
                                  <input
                                    placeholder="Reply..."
                                    value={commentInputs[`${r.id}-${c.id}`] || ''}
                                    onChange={e => setCommentInputs(prev => ({ ...prev, [`${r.id}-${c.id}`]: e.target.value }))}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                  />
                                  <button
                                    onClick={() => handleSubmitComment(r.id, c.id)}
                                    className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-lg"
                                  >Reply</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Main Comment Input */}
                        {isLoggedIn ? (
                          <div className="flex gap-2 mt-2">
                            <input
                              placeholder="Write a comment..."
                              value={commentInputs[r.id] || ''}
                              onChange={e => setCommentInputs(prev => ({ ...prev, [r.id]: e.target.value }))}
                              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                            <button
                              onClick={() => handleSubmitComment(r.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-xl"
                            >Send</button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400"><Link to="/login" className="text-indigo-500">Sign in</Link> to comment</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <p className="text-3xl font-bold text-indigo-600 mb-0.5">${tour.price}</p>
            <p className="text-gray-400 text-sm mb-5">per person · {tour.duration} days</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
            <input
              type="date" value={bookingDate}
              onChange={e => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="internet_banking">Internet Banking</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
            </select>

            {bookingMsg && <p className="text-sm mb-4 text-center font-medium">{bookingMsg}</p>}

            <button
              onClick={handleBook} disabled={booking}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {booking ? 'Booking...' : isLoggedIn ? '🗓️ Book Now' : '🔑 Sign in to Book'}
            </button>

            {isLoggedIn && (
              <Link to="/user/dashboard" className="block text-center text-xs text-gray-400 hover:text-indigo-500 mt-3">
                View my bookings →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
