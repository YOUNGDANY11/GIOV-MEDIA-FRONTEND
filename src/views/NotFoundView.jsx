import { Link } from 'react-router-dom'

import { Card } from '../components/ui/Card'

export function NotFoundView() {
  return (
    <div className="auth-shell">
      <Card className="relative overflow-hidden auth-card">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
        <div className="relative">
          <h1 className="text-xl font-semibold tracking-tight">Ruta no encontrada</h1>
          <p className="mt-2 text-sm text-neutral-300">La página solicitada no existe en esta interfaz.</p>
          <Link to="/dashboard" className="mt-4 inline-flex items-center h-11 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 text-white shadow-[0_10px_30px_-18px_rgba(99,102,241,0.8)]">Volver al dashboard</Link>
        </div>
      </Card>
    </div>
  )
}
