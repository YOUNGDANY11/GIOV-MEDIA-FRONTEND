import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'
import { roleName } from '../utils/roles'
import { icons } from '../components/ui/icons'
import { buildUrl } from '../services/apiClient'

export function MeView() {
  const { user } = useAuth()
  const avatarSrc = user?.avatar ? buildUrl(user.avatar) : ''

  return (
    <div className="grid gap-5">
      <PageHeader title="Mi perfil" subtitle="Información de la cuenta autenticada." icon={icons.user} />

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-semibold tracking-tight truncate">{user?.name ?? ''} {user?.lastname ?? ''}</div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-200/90">{roleName(user?.id_role)}</div>
            </div>
            <div className="mt-1 text-sm text-neutral-300">{user?.email || 'Sin correo'}</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-300">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Documento: {user?.document || '—'}</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Estado: Activo</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="text-xs text-neutral-400">Nombre</div>
          <div className="mt-2 text-lg font-semibold">{user?.name} {user?.lastname}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-400">Rol</div>
          <div className="mt-2 text-lg font-semibold">{roleName(user?.id_role)}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-400">Documento</div>
          <div className="mt-2 text-lg font-semibold">{user?.document || '—'}</div>
        </Card>
        <Card>
          <div className="text-xs text-neutral-400">Correo</div>
          <div className="mt-2 text-lg font-semibold break-words">{user?.email || '—'}</div>
        </Card>
      </div>
    </div>
  )
}
