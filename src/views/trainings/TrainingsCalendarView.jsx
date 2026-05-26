import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale/es'

import { Alert } from '../../components/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/layout/PageHeader'
import { icons } from '../../components/ui/icons'
import { trainingController } from '../../controllers/trainingController'
import { useAuth } from '../../context/AuthContext'
import { isAdmin } from '../../utils/roles'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../../styles/calendar-dark.css'

// ─── Localizer (español, semana desde lunes) ─────────────────────────────────
const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
})

const messages = {
  allDay:          'Todo el día',
  previous:        '‹',
  next:            '›',
  today:           'Hoy',
  month:           'Mes',
  week:            'Semana',
  day:             'Día',
  agenda:          'Agenda',
  date:            'Fecha',
  time:            'Hora',
  event:           'Entrenamiento',
  noEventsInRange: 'No hay entrenamientos en este período.',
  showMore:        (n) => `+ ${n} más`,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toEvent = (t) => {
  const dateStr = String(t.date ?? '').slice(0, 10)
  const rawTime = String(t.time ?? '00:00').slice(0, 5)  // HH:MM
  const start   = new Date(`${dateStr}T${rawTime}:00`)
  const end     = new Date(start.getTime() + 90 * 60_000) // duración visual: 1h 30m
  return { title: t.name, start, end, resource: t }
}

const eventStyleGetter = () => ({
  style: {
    background:   'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
    border:       'none',
    borderRadius: '8px',
    color:        '#fff',
    fontSize:     '0.78rem',
    fontWeight:   '600',
    padding:      '2px 7px',
    cursor:       'pointer',
    boxShadow:    '0 4px 12px -4px rgba(99,102,241,0.55)',
  },
})

// ─── Component ───────────────────────────────────────────────────────────────
export function TrainingsCalendarView() {
  const { user } = useAuth()
  const admin = isAdmin(user?.id_role)

  const [trainings, setTrainings] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState(null)
  const [view, setView]           = useState(Views.MONTH)
  const [date, setDate]           = useState(new Date())

  // ── Cargar entrenamientos ────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    const boot = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await trainingController.getAll()
        if (!alive) return
        setTrainings(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'No se pudieron cargar los entrenamientos')
      } finally {
        if (alive) setLoading(false)
      }
    }
    boot()
    return () => { alive = false }
  }, [])

  // ── Mapear a eventos de calendario ──────────────────────────────────────
  const events = useMemo(() => trainings.map(toEvent), [trainings])

  const onSelectEvent = useCallback((event) => {
    setSelected(event.resource)
  }, [])

  const closeModal = useCallback(() => setSelected(null), [])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-4">
      <PageHeader
        title="Entrenamientos"
        subtitle={
          admin
            ? 'Crea y gestiona los entrenamientos. Haz clic en un evento para editarlo o ver sus asistencias.'
            : 'Consulta los entrenamientos programados. Haz clic en un evento para ver los detalles.'
        }
        icon={icons.trainings}
        actions={
          admin ? (
            <Link
              to="/trainings/new"
              className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 text-white text-sm font-medium shadow-[0_10px_30px_-18px_rgba(99,102,241,0.8)]"
            >
              <span>{icons.plus}</span>
              <span>Nuevo entrenamiento</span>
            </Link>
          ) : null
        }
      />

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="text-neutral-400 py-8 text-center">Cargando entrenamientos...</div>
        ) : (
          <div style={{ height: 620 }}>
            <Calendar
              localizer={localizer}
              events={events}
              view={view}
              date={date}
              onView={setView}
              onNavigate={setDate}
              onSelectEvent={onSelectEvent}
              eventPropGetter={eventStyleGetter}
              messages={messages}
              culture="es"
              style={{ height: '100%' }}
              popup
            />
          </div>
        )}
      </Card>

      {/* ── Modal detalle / acciones ─────────────────────────────────── */}
      <Modal
        open={Boolean(selected)}
        title={selected?.name ?? 'Entrenamiento'}
        onClose={closeModal}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {admin ? (
              <>
                <Link
                  to={`/attendances/training/${selected?.id_training}`}
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5 text-sm"
                >
                  <span>{icons.attendances}</span>
                  <span>Ver asistencias</span>
                </Link>
                <Link
                  to={`/trainings/${selected?.id_training}/edit`}
                  onClick={closeModal}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 text-white text-sm font-medium"
                >
                  <span>{icons.edit}</span>
                  <span>Editar</span>
                </Link>
              </>
            ) : null}
            <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
          </div>
        }
      >
        {selected ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre"     value={selected.name     ?? ''} readOnly />
            <Input label="Ubicación"  value={selected.location ?? ''} readOnly />
            <Input label="Fecha"      value={String(selected.date ?? '').slice(0, 10)} readOnly />
            <Input label="Hora"       value={String(selected.time ?? '').slice(0, 5)}  readOnly />
            {selected.description ? (
              <div className="sm:col-span-2">
                <Input label="Descripción" value={selected.description} readOnly />
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
