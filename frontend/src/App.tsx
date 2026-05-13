import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import ToursPage from './pages/Tours'
import TourDetail from './pages/TourDetail'
import ReviewsPage from './pages/Reviews'
import UserDashboard from './pages/UserDashboard'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCategories from './pages/admin/Categories'
import AdminTours from './pages/admin/Tours'
import AdminReviews from './pages/admin/Reviews'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/tours" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/reviews" element={<ReviewsPage />} />

        {/* User */}
        <Route path="/user/dashboard" element={<UserDashboard />} />

        {/* Admin (nested under shared layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<AdminDashboard />} />
          <Route path="users"      element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tours"      element={<AdminTours />} />
          <Route path="reviews"    element={<AdminReviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
