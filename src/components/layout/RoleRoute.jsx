import { Navigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

export function RoleRoute({ allowedRoles = [], children }) {
  const { loading, user } = useAuth()

  if (loading) {
    return <div className="panel text-neutral-200">Cargando...</div>
  }

  if (!allowedRoles.map(Number).includes(Number(user?.id_role))) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
