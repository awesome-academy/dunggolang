import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface Review {
  id: number
  content: string
  rating: number
  likes_count: number
  target_type: string
  target_id: number
  created_at: string
  user?: { email: string; full_name: string }
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    api.get('/admin/reviews').then(res => setReviews(res.data.reviews || []))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this review?')) return
    await api.delete(`/admin/reviews/${id}`)
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
        <p className="text-gray-400 text-sm mt-1">{reviews.length} total reviews</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-5 text-left">User</th>
              <th className="py-3 px-5 text-left">Content</th>
              <th className="py-3 px-5 text-center">Type</th>
              <th className="py-3 px-5 text-center">Rating</th>
              <th className="py-3 px-5 text-center">Likes</th>
              <th className="py-3 px-5 text-left">Date</th>
              <th className="py-3 px-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-5">
                  <p className="font-medium text-gray-800">{r.user?.full_name || '—'}</p>
                  <p className="text-xs text-gray-400">{r.user?.email}</p>
                </td>
                <td className="py-3.5 px-5 max-w-xs">
                  <p className="text-gray-600 line-clamp-2">{r.content}</p>
                </td>
                <td className="py-3.5 px-5 text-center">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">{r.target_type}</span>
                </td>
                <td className="py-3.5 px-5 text-center text-yellow-400 font-medium">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </td>
                <td className="py-3.5 px-5 text-center text-gray-500">❤️ {r.likes_count}</td>
                <td className="py-3.5 px-5 text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="py-3.5 px-5 text-center">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition"
                  >Delete</button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={7} className="py-10 text-center text-gray-400">No reviews found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
