import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface Category {
  id: number
  name: string
  description: string
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('')

  const fetchCategories = async () => {
    const res = await api.get('/categories')
    setCategories(res.data.categories || [])
  }

  useEffect(() => { fetchCategories() }, [])

  const openCreate = () => { setEditTarget(null); setName(''); setDescription(''); setMsg(''); setShowForm(true) }
  const openEdit = (cat: Category) => { setEditTarget(cat); setName(cat.name); setDescription(cat.description); setMsg(''); setShowForm(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editTarget) {
        await api.put(`/admin/categories/${editTarget.id}`, { name, description })
        setMsg('✅ Updated')
      } else {
        await api.post('/admin/categories', { name, description })
        setMsg('✅ Created')
      }
      setShowForm(false)
      fetchCategories()
    } catch (err: any) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed'))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return
    await api.delete(`/admin/categories/${id}`)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >+ Add Category</button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">{editTarget ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-5 py-2.5 rounded-xl transition">
                {editTarget ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-5 py-2.5 rounded-xl transition">
                Cancel
              </button>
            </div>
          </form>
          {msg && <p className="text-sm mt-3">{msg}</p>}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-5 text-left">Name</th>
              <th className="py-3 px-5 text-left">Description</th>
              <th className="py-3 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-5 font-medium text-gray-800">{cat.name}</td>
                <td className="py-3.5 px-5 text-gray-500">{cat.description}</td>
                <td className="py-3.5 px-5 text-center space-x-2">
                  <button onClick={() => openEdit(cat)} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition">Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="py-10 text-center text-gray-400">No categories yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
