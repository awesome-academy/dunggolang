import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../lib/api'

interface RevenueData {
  summary: {
    total_revenue: number
    total_bookings: number
    total_payments: number
  }
  monthly: { month: string; amount: number }[]
}

interface Booking {
  id: number
  status: string
  total_price: number
  booking_date: string
  user?: { email: string }
  tour?: { title: string }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    api.get('/admin/revenue').then(res => setRevenue(res.data)).catch(() => navigate('/login'))
    api.get('/admin/bookings').then(res => setBookings(res.data.bookings || []))
  }, [])

  const fetchBookings = async () => {
    const params = filterStatus ? `?status=${filterStatus}` : ''
    const res = await api.get(`/admin/bookings${params}`)
    setBookings(res.data.bookings || [])
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    await api.put(`/admin/bookings/${id}/status`, { status })
    fetchBookings()
  }

  const statusColor: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    paid: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50',
    completed: 'text-blue-600 bg-blue-50',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-56 min-h-screen bg-indigo-900 text-white flex flex-col p-5 gap-2 fixed top-0 left-0">
          <div className="text-xl font-bold mb-6">🌏 SUN Admin</div>
          {[
            { to: '/admin/dashboard', label: '📊 Dashboard' },
            { to: '/admin/users', label: '👥 Users' },
            { to: '/admin/categories', label: '🗂️ Categories' },
            { to: '/admin/tours', label: '🗺️ Tours' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="hover:bg-indigo-700 px-3 py-2 rounded-lg text-sm transition">
              {item.label}
            </Link>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
            className="text-sm bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg"
          >Logout</button>
        </aside>

        {/* Main Content */}
        <main className="ml-56 flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>

          {/* Stats Cards */}
          {revenue && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-indigo-600">${revenue.summary.total_revenue.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-400 text-sm mb-1">Paid Bookings</p>
                <p className="text-3xl font-bold text-green-600">{revenue.summary.total_bookings}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                <p className="text-3xl font-bold text-purple-600">{revenue.summary.total_payments}</p>
              </div>
            </div>
          )}

          {/* Monthly Revenue Chart */}
          {revenue && revenue.monthly?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[...revenue.monthly].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: unknown) => `$${(val as number).toFixed(2)}`} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-700">Manage Bookings</h2>
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); }}
                onBlur={fetchBookings}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Tour</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="py-3 px-4 text-gray-400">#{b.id}</td>
                      <td className="py-3 px-4">{b.user?.email || '-'}</td>
                      <td className="py-3 px-4 font-medium">{b.tour?.title || '-'}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(b.booking_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right font-semibold text-indigo-600">${b.total_price}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColor[b.status] || ''}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <select
                          onChange={e => handleStatusUpdate(b.id, e.target.value)}
                          defaultValue=""
                          className="border border-gray-300 text-xs rounded-lg px-2 py-1"
                        >
                          <option value="" disabled>Change</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-gray-400">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
