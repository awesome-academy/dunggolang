import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/admin/dashboard',  icon: '📊', label: 'Dashboard'  },
  { to: '/admin/users',      icon: '👥', label: 'Users'      },
  { to: '/admin/categories', icon: '🗂️', label: 'Categories' },
  { to: '/admin/tours',      icon: '🗺️', label: 'Tours'      },
  { to: '/admin/reviews',    icon: '⭐', label: 'Reviews'    },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-indigo-900 text-white flex flex-col fixed inset-y-0 left-0 z-20 shadow-2xl">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-indigo-800">
          <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">Admin Panel</p>
          <p className="text-xl font-bold text-white">🌏 SUN Booking</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: User + Logout */}
        <div className="px-4 py-4 border-t border-indigo-800 space-y-2">
          <NavLink
            to="/tours"
            className="flex items-center gap-2 text-indigo-300 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-indigo-800 transition"
          >
            <span>🔗</span> View Site
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition font-medium"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 flex-1 min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
