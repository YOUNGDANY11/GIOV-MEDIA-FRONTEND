import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { attendanceController } from '../controllers/attendanceController'
import { mediaController } from '../controllers/mediaController'
import { trainingController } from '../controllers/trainingController'
import { weekController } from '../controllers/weekController'
import { userController } from '../controllers/userController'
import { isAdmin, isAthlete } from '../utils/roles'
import { icons } from '../components/ui/icons'
import { Button } from '../components/ui/Button'

export function DashboardView() {
  const { user } = useAuth()
  const role = user?.id_role
  const [stats, setStats] = useState({})

  useEffect(() => {
    let alive = true

    const boot = async () => {
      try {
        const items = {}

        if (isAdmin(role)) {
          const [users, trainings, weeks, media, attendances] = await Promise.all([
            userController.getAll().catch(() => []),
            trainingController.getAll().catch(() => []),
            weekController.getAll().catch(() => []),
            mediaController.getAll().catch(() => []),
            attendanceController.getAll().catch(() => []),
          ])
          items.users = users.length
          items.trainings = trainings.length
          items.weeks = weeks.length
          items.media = media.length
          items.attendances = attendances.length
        } else if (isAthlete(role)) {
          const [trainings, media, attendances] = await Promise.all([
            trainingController.getAll().catch(() => []),
            mediaController.getMine().catch(() => []),
            attendanceController.getMine().catch(() => []),
          ])
          items.trainings = trainings.length
          items.media = media.length
          items.attendances = attendances.length
        } else {
          const trainings = await trainingController.getAll().catch(() => [])
          items.trainings = trainings.length
        }

        if (alive) setStats(items)
      } catch {
        if (alive) setStats({})
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [role])

  const cards = useMemo(() => {
    const list = [
      { label: 'Entrenamientos', value: stats.trainings ?? 0, to: '/trainings', icon: icons.trainings },
    ]

    if (isAdmin(role)) {
      list.push({ label: 'Usuarios', value: stats.users ?? 0, to: '/users', icon: icons.users })
      list.push({ label: 'Semanas', value: stats.weeks ?? 0, to: '/weeks', icon: icons.calendar })
      list.push({ label: 'Media', value: stats.media ?? 0, to: '/media', icon: icons.media })
      list.push({ label: 'Asistencias', value: stats.attendances ?? 0, to: '/attendances/list', icon: icons.attendances })
      list.push({ label: 'Agenda QR', value: 'Open', to: '/agenda', icon: icons.scan })
    }

    if (isAthlete(role)) {
      list.push({ label: 'Mis asistencias', value: stats.attendances ?? 0, to: '/my-attendances', icon: icons.attendances })
      list.push({ label: 'Subidas', value: stats.media ?? 0, to: '/media/mine', icon: icons.media })
      list.push({ label: 'Registrar', value: 'QR', to: '/attendance/scan', icon: icons.scan })
    }

    return list
  }, [role, stats])

  return (
    <div className="grid gap-5">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-xs text-neutral-200/90">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1">
                  <span className="text-sm leading-none text-white opacity-90" aria-hidden="true">{icons.dashboard}</span>
                  <span>Panel</span>
                </span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
                Bienvenido{user ? `, ${user.name} ${user.lastname}` : ''}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-300">
                Desde aquí puedes administrar entrenamientos, asistencias QR y media, según tu rol.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to="/me" className="inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5">
                Mi perfil
              </Link>
              <Link to="/trainings" className="inline-flex items-center h-11 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 text-white shadow-[0_10px_30px_-18px_rgba(99,102,241,0.8)]">
                Entrenamientos
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
              <div className="relative flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-black/25 flex items-center justify-center text-white">
                    <span className="text-lg leading-none text-white opacity-90" aria-hidden="true">{card.icon}</span>
                  </div>
                  <div className="text-xs text-neutral-300/90 rounded-full border border-white/10 bg-black/20 px-2 py-1">Acceso</div>
                </div>

                <div>
                  <div className="text-base font-semibold">{card.label}</div>
                  <div className="text-sm text-neutral-200/85 mt-1">Abrir módulo</div>
                </div>

                <div className="mt-auto text-3xl font-semibold tracking-tight">{card.value}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="mt-0 text-lg font-semibold tracking-tight">Flujo QR de asistencias</h2>
            <p className="text-neutral-300">
              El administrador genera un QR desde la agenda. El deportista lo abre, confirma su sesión y el backend valida la ventana de tiempo definida para el entrenamiento.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {isAthlete(role) ? (
              <Button icon={<span className="text-white" aria-hidden="true">{icons.scan}</span>} onClick={() => window.location.assign('/attendance/scan')}>Abrir escáner</Button>
            ) : null}
            {isAdmin(role) ? (
              <Link to="/agenda" className="inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5">Generar QR</Link>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  )
}
