import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Booking {
  id: number
  status: string
  booking_date: string
  total_price: number
  tour?: { title: string; location: string }
}

interface BankAccount {
  id: number
  bank_name: string
  account_number: string
  account_name: string
}

interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: string
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'bookings' | 'profile' | 'banks'>('bookings')
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [banks, setBanks] = useState<BankAccount[]>([])
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [newBank, setNewBank] = useState({ bank_name: '', account_number: '', account_name: '' })
  const [bankMsg, setBankMsg] = useState('')

  useEffect(() => {
    api.get('/user/profile').then(res => {
      setUser(res.data.user)
      setEditName(res.data.user.full_name)
      setEditPhone(res.data.user.phone)
    }).catch(() => navigate('/login'))

    api.get('/bookings/').then(res => setBookings(res.data.bookings || []))
    api.get('/user/bank-accounts').then(res => setBanks(res.data.accounts || []))
  }, [])

  const handlePay = async (bookingId: number) => {
    try {
      await api.post(`/bookings/${bookingId}/pay`)
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'paid' } : b))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Payment failed')
    }
  }

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await api.put(`/bookings/${bookingId}/cancel`)
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Cancel failed')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.put('/user/profile', { full_name: editName, phone: editPhone })
      setUser(res.data.user)
      setProfileMsg('✅ Profile updated!')
    } catch {
      setProfileMsg('❌ Update failed')
    }
  }

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/user/bank-accounts', newBank)
      setBanks(prev => [...prev, res.data.account])
      setNewBank({ bank_name: '', account_number: '', account_name: '' })
      setBankMsg('✅ Bank account added!')
    } catch {
      setBankMsg('❌ Failed to add bank account')
    }
  }

  const handleDeleteBank = async (id: number) => {
    if (!confirm('Delete this bank account?')) return
    await api.delete(`/user/bank-accounts/${id}`)
    setBanks(prev => prev.filter(b => b.id !== id))
  }

  const statusColor: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50',
    paid: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50',
    completed: 'text-blue-600 bg-blue-50',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/tours" className="text-indigo-700 font-bold text-xl">🌏 SUN Booking</Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">{user?.email}</span>
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm"
            >Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Account</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {(['bookings', 'profile', 'banks'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 font-medium text-sm capitalize transition border-b-2 -mb-px ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >{t === 'banks' ? 'Bank Accounts' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg mb-4">No bookings yet</p>
                <Link to="/tours" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700">
                  Browse Tours
                </Link>
              </div>
            ) : bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{b.tour?.title || 'Tour'}</h3>
                  <p className="text-gray-400 text-sm">📍 {b.tour?.location} · {new Date(b.booking_date).toLocaleDateString()}</p>
                  <p className="text-indigo-600 font-semibold mt-1">${b.total_price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusColor[b.status] || ''}`}>
                    {b.status}
                  </span>
                  <div className="flex gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => handlePay(b.id)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg">Pay</button>
                        <button onClick={() => handleCancel(b.id)} className="bg-red-100 hover:bg-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && user && (
          <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input value={user.email} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              {profileMsg && <p className="text-sm">{profileMsg}</p>}
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-sm">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Bank Accounts Tab */}
        {tab === 'banks' && (
          <div className="space-y-6">
            <div className="space-y-3">
              {banks.length === 0 ? <p className="text-gray-400 text-sm">No bank accounts added yet.</p> : banks.map(b => (
                <div key={b.id} className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-700">{b.bank_name}</p>
                    <p className="text-sm text-gray-500">{b.account_number} · {b.account_name}</p>
                  </div>
                  <button onClick={() => handleDeleteBank(b.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 max-w-md">
              <h3 className="font-bold text-gray-700 mb-4">Add Bank Account</h3>
              <form onSubmit={handleAddBank} className="space-y-3">
                <input
                  placeholder="Bank Name (e.g. VietcomBank)"
                  value={newBank.bank_name}
                  onChange={e => setNewBank({ ...newBank, bank_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
                <input
                  placeholder="Account Number"
                  value={newBank.account_number}
                  onChange={e => setNewBank({ ...newBank, account_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
                <input
                  placeholder="Account Holder Name"
                  value={newBank.account_name}
                  onChange={e => setNewBank({ ...newBank, account_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
                {bankMsg && <p className="text-sm">{bankMsg}</p>}
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-sm">
                  Add Account
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
