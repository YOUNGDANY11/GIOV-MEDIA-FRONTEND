import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import heroImage from '../assets/hero.png'
import proLogo from '../assets/pro.png'
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
  const navigate = useNavigate()
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

    list.push({ label: 'Progresión', value: 'Obtencion data', to: '/dashboard', icon: icons.progression, soon: true })
    list.push({ label: 'Desarrollo', value: 'Analitica', to: '/dashboard', icon: icons.development, soon: true })

    return list
  }, [role, stats])

  return (
    <div className="grid gap-2">
      <div className="relative overflow-hidden rounded-2xl border border-border shadow-[0_12px_30px_-px_rgba(0,0,0,0.9)]">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center blur-[1px]"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" aria-hidden="true" />

        <img src={proLogo} alt="Pro" className="absolute top-2 right-4 sm:top-3 sm:right-6 h-24 w-24 sm:h-24 sm:w-40 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]" />

        <div className="relative px-6 py-[3.15rem] sm:px-10 sm:py-[3.5rem]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-neutral-200/90">
            <span className="text-sm leading-none text-white opacity-90" aria-hidden="true">{icons.trainings}</span>
            <span>Plataforma de gestión deportiva</span>
          </span>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Software enfocado al fútbol y al fútbol sala
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-neutral-200/90 sm:text-base">
            Planificación y gestión de entrenamientos, integración de sesiones colectivas e individuales, y una proyección hacia el desarrollo progresivo del rendimiento mediante analítica deportiva de datos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const body = (
            <Card className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
              <div className="relative flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-black/25 flex items-center justify-center text-white">
                    <span className="text-lg leading-none text-white opacity-90" aria-hidden="true">{card.icon}</span>
                  </div>
                  <div className="text-xs text-neutral-300/90 rounded-full border border-white/10 bg-black/20 px-2 py-1">
                    {card.soon ? 'En desarrollo' : 'Acceso'}
                  </div>
                </div>

                <div>
                  <div className="text-base font-semibold">{card.label}</div>
                  <div className="text-sm text-neutral-200/85 mt-1">{card.soon ? 'Próximamente' : 'Abrir módulo'}</div>
                </div>

                <div className="mt-auto text-3xl font-semibold tracking-tight">{card.value}</div>
              </div>
            </Card>
          )

          if (card.soon) {
            return (
              <button
                key={card.label}
                type="button"
                className="text-left h-full"
                onClick={() => {
                  window.alert('Módulo en desarrollo')
                  navigate('/dashboard')
                }}
              >
                {body}
              </button>
            )
          }

          return (
            <Link key={card.label} to={card.to}>
              {body}
            </Link>
          )
        })}
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="mt-0 text-lg font-semibold tracking-tight">Generar Qr de asistencia</h2>

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
