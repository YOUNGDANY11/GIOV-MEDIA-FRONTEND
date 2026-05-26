import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <div className="auth-shell"><div className="panel text-neutral-200">Cargando sesión...</div></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children ?? <Outlet />
}
