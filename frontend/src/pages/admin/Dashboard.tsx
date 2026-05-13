import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../lib/api'

interface RevenueData {
  summary: { total_revenue: number; total_bookings: number; total_payments: number }
  monthly: { month: string; amount: number }[]
}

interface Booking {
  id: number
  status: string
  total_price: number
  booking_date: string
  user?: { email: string; full_name: string }
  tour?: { title: string }
}

const statusColor: Record<string, string> = {
  pending:   'text-yellow-700 bg-yellow-100',
  paid:      'text-green-700  bg-green-100',
  cancelled: 'text-red-700    bg-red-100',
  completed: 'text-blue-700   bg-blue-100',
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

  const fetchBookings = async (status: string) => {
    const params = status ? `?status=${status}` : ''
    const res = await api.get(`/admin/bookings${params}`)
    setBookings(res.data.bookings || [])
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    await api.put(`/admin/bookings/${id}/status`, { status })
    fetchBookings(filterStatus)
  }

  const stat = revenue?.summary

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your business</p>
      </div>

      {/* Stats */}
      {stat && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Revenue',      value: `$${stat.total_revenue.toFixed(2)}`, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '💰' },
            { label: 'Paid Bookings',       value: stat.total_bookings,                color: 'text-green-600',  bg: 'bg-green-50',  icon: '📋' },
            { label: 'Total Transactions',  value: stat.total_payments,                color: 'text-purple-600', bg: 'bg-purple-50', icon: '💳' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-6 flex items-center gap-4`}>
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {revenue?.monthly && revenue.monthly.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Monthly Revenue (last 12 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[...revenue.monthly].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val: unknown) => `$${(val as number).toFixed(2)}`} />
              <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-gray-700">Recent Bookings</h2>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); fetchBookings(e.target.value) }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
              <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="pb-3 px-2 text-left">ID</th>
                <th className="pb-3 px-2 text-left">User</th>
                <th className="pb-3 px-2 text-left">Tour</th>
                <th className="pb-3 px-2 text-left">Date</th>
                <th className="pb-3 px-2 text-right">Price</th>
                <th className="pb-3 px-2 text-center">Status</th>
                <th className="pb-3 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-2 text-gray-400 text-xs">#{b.id}</td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-700">{b.user?.full_name || '-'}</p>
                    <p className="text-xs text-gray-400">{b.user?.email}</p>
                  </td>
                  <td className="py-3 px-2 font-medium text-gray-700">{b.tour?.title || '-'}</td>
                  <td className="py-3 px-2 text-gray-500 text-xs">{new Date(b.booking_date).toLocaleDateString()}</td>
                  <td className="py-3 px-2 text-right font-semibold text-indigo-600">${b.total_price}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[b.status] || ''}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <select
                      onChange={e => handleStatusUpdate(b.id, e.target.value)}
                      defaultValue=""
                      className="border border-gray-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
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
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">No bookings found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
