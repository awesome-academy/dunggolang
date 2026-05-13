import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

interface Category {
  id: number
  name: string
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryID, setCategoryID] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchTours = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryID) params.set('category_id', categoryID)
      const res = await api.get(`/tours?${params.toString()}`)
      setTours(res.data.tours || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.categories || []))
    fetchTours()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTours()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">🌏 SUN Booking</h1>
          <div className="flex gap-4">
            {localStorage.getItem('token') ? (
              <>
                <Link to="/reviews" className="text-gray-500 hover:text-indigo-600 text-sm font-medium">Reviews</Link>
                <Link to="/user/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">My Account</Link>
                <button
                  onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm"
                >Logout</button>
              </>
            ) : (
              <>
                <Link to="/reviews" className="text-gray-500 hover:text-indigo-600 text-sm font-medium">Reviews</Link>
                <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Explore Amazing Tours</h2>
        <p className="text-lg opacity-80 mb-8">Book your next adventure with SUN Booking</p>
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Search by destination or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-gray-800 outline-none shadow"
          />
          <button type="submit" className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl shadow hover:bg-indigo-50">
            Search
          </button>
        </form>
      </section>

      {/* Filter by category */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-2 flex-wrap">
        <button
          onClick={() => { setCategoryID(''); fetchTours() }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${categoryID === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategoryID(String(cat.id)); fetchTours() }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${categoryID === String(cat.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}
          >{cat.name}</button>
        ))}
      </div>

      {/* Tour Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-24 text-gray-400">Loading tours...</div>
        ) : tours.length === 0 ? (
          <div className="text-center py-24 text-gray-400">No tours found. Try a different search.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => (
              <Link
                to={`/tours/${tour.id}`}
                key={tour.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group"
              >
                <div className="bg-gradient-to-br from-indigo-400 to-purple-500 h-44 flex items-center justify-center text-white text-4xl">
                  🗺️
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition">{tour.title}</h3>
                    <span className="text-indigo-600 font-bold text-lg">${tour.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{tour.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>📍 {tour.location}</span>
                    <span>⏱️ {tour.duration} days</span>
                  </div>
                  {tour.category && (
                    <span className="inline-block mt-3 bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full">
                      {tour.category.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
