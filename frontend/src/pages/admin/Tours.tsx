import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface Category { id: number; name: string }
interface Tour {
  id: number; title: string; description: string
  price: number; duration: number; location: string
  category_id: number; category?: { name: string }
}

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Tour | null>(null)
  const [form, setForm] = useState({ title: '', description: '', price: '', duration: '', location: '', category_id: '' })
  const [msg, setMsg] = useState('')

  const fetchTours = async () => {
    const res = await api.get('/tours')
    setTours(res.data.tours || [])
  }

  useEffect(() => {
    fetchTours()
    api.get('/categories').then(res => setCategories(res.data.categories || []))
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm({ title: '', description: '', price: '', duration: '', location: '', category_id: '' })
    setMsg(''); setShowForm(true)
  }

  const openEdit = (tour: Tour) => {
    setEditTarget(tour)
    setForm({
      title: tour.title, description: tour.description,
      price: String(tour.price), duration: String(tour.duration),
      location: tour.location, category_id: String(tour.category_id)
    })
    setMsg(''); setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, price: Number(form.price), duration: Number(form.duration), category_id: Number(form.category_id) }
    try {
      if (editTarget) {
        await api.put(`/admin/tours/${editTarget.id}`, payload)
        setMsg('✅ Updated')
      } else {
        await api.post('/admin/tours', payload)
        setMsg('✅ Created')
      }
      setShowForm(false)
      fetchTours()
    } catch (err: any) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed'))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tour?')) return
    await api.delete(`/admin/tours/${id}`)
    setTours(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tours</h1>
          <p className="text-gray-400 text-sm mt-1">{tours.length} tours available</p>
        </div>
        <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition">
          + Add Tour
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">{editTarget ? 'Edit Tour' : 'New Tour'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {([
              { key: 'title',       label: 'Title *',       type: 'text',   span: 2, required: true },
              { key: 'description', label: 'Description',   type: 'text',   span: 2 },
              { key: 'location',    label: 'Location *',    type: 'text',   span: 1, required: true },
              { key: 'price',       label: 'Price ($) *',   type: 'number', span: 1, required: true },
              { key: 'duration',    label: 'Duration (days) *', type: 'number', span: 1, required: true },
            ] as const).map(field => (
              <div key={field.key} className={field.span === 2 ? 'col-span-2' : 'col-span-1'}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  required={'required' in field}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex gap-2 mt-1">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2.5 rounded-xl transition">
                {editTarget ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-5 py-2.5 rounded-xl transition">
                Cancel
              </button>
              {msg && <span className="self-center text-sm">{msg}</span>}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-5 text-left">Title</th>
              <th className="py-3 px-5 text-left">Category</th>
              <th className="py-3 px-5 text-left">Location</th>
              <th className="py-3 px-5 text-right">Price</th>
              <th className="py-3 px-5 text-center">Duration</th>
              <th className="py-3 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tours.map(tour => (
              <tr key={tour.id} className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-5 font-medium text-gray-800">{tour.title}</td>
                <td className="py-3.5 px-5">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
                    {tour.category?.name || '—'}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-gray-500">📍 {tour.location}</td>
                <td className="py-3.5 px-5 text-right font-semibold text-indigo-600">${tour.price}</td>
                <td className="py-3.5 px-5 text-center text-gray-500">{tour.duration}d</td>
                <td className="py-3.5 px-5 text-center space-x-2">
                  <button onClick={() => openEdit(tour)} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition">Edit</button>
                  <button onClick={() => handleDelete(tour.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition">Delete</button>
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">No tours yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
