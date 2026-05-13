import { useEffect, useState } from 'react'
import api from '../../lib/api'

interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    api.get('/admin/users').then(res => setUsers(res.data.users || []))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change ${user.email} to ${newRole}?`)) return
    await api.put(`/admin/users/${user.id}`, { role: newRole })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} registered accounts</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
              <th className="py-3 px-5 text-left">User</th>
              <th className="py-3 px-5 text-left">Phone</th>
              <th className="py-3 px-5 text-center">Role</th>
              <th className="py-3 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="py-3.5 px-5">
                  <p className="font-medium text-gray-800">{user.full_name || '—'}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </td>
                <td className="py-3.5 px-5 text-gray-500">{user.phone || '—'}</td>
                <td className="py-3.5 px-5 text-center">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-center space-x-2">
                  <button
                    onClick={() => handleRoleToggle(user)}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg transition"
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="py-10 text-center text-gray-400">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
