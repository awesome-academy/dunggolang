import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'

interface Tour {
  id: number
  title: string
  description: string
  price: number
  duration: number
  location: string
  category?: { name: string }
}

interface Review {
  id: number
  content: string
  rating: number
  likes_count: number
  user?: { full_name: string; email: string }
  created_at: string
}

export default function TourDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tour, setTour] = useState<Tour | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingDate, setBookingDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('internet_banking')
  const [booking, setBooking] = useState(false)
  const [bookingMsg, setBookingMsg] = useState('')

  const isLoggedIn = !!localStorage.getItem('token')

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

    setBooking(true)
    setBookingMsg('')
    try {
      await api.post('/bookings/', {
        tour_id: Number(id),
        booking_date: new Date(bookingDate).toISOString(),
        payment_method: paymentMethod
      })
      setBookingMsg('✅ Booking created! Go to My Account to pay.')
    } catch (err: any) {
      setBookingMsg('❌ ' + (err.response?.data?.error || 'Booking failed'))
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!tour) return <div className="min-h-screen flex items-center justify-center text-red-500">Tour not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/tours" className="text-indigo-700 font-bold text-xl">← SUN Booking</Link>
          {isLoggedIn && <Link to="/user/dashboard" className="text-gray-600 hover:text-indigo-600 text-sm">My Account</Link>}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tour Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl h-60 flex items-center justify-center text-white text-7xl">
            🗺️
          </div>

          <div>
            {tour.category && (
              <span className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full mb-3 inline-block">
                {tour.category.name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-800 mt-2">{tour.title}</h1>
            <div className="flex gap-6 text-gray-500 mt-3 text-sm">
              <span>📍 {tour.location}</span>
              <span>⏱️ {tour.duration} days</span>
              <span className="text-indigo-600 font-bold text-base">${tour.price}</span>
            </div>
            <p className="text-gray-600 mt-4 leading-relaxed">{tour.description}</p>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-700">{r.user?.full_name || r.user?.email}</p>
                        <div className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{r.content}</p>
                    <p className="text-xs text-gray-400 mt-2">❤️ {r.likes_count} likes</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <p className="text-3xl font-bold text-indigo-600 mb-1">${tour.price}</p>
            <p className="text-gray-400 text-sm mb-6">per person</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={e => setBookingDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-6 outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="internet_banking">Internet Banking</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
            </select>

            {bookingMsg && (
              <p className="text-sm mb-4 text-center font-medium">{bookingMsg}</p>
            )}

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {booking ? 'Booking...' : isLoggedIn ? 'Book Now' : 'Sign in to Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
