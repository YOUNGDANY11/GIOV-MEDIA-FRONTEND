import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale/es'

import { Alert } from '../../components/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { DataTable } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/layout/PageHeader'
import { icons } from '../../components/ui/icons'
import { attendanceController } from '../../controllers/attendanceController'
import { trainingController } from '../../controllers/trainingController'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../../styles/calendar-dark.css'

// ─── Localizer ───────────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { es },
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
const toEvent = (training, count) => {
  const dateStr = String(training.date ?? '').slice(0, 10)
  const rawTime = String(training.time ?? '00:00').slice(0, 5)
  const start   = new Date(`${dateStr}T${rawTime}:00`)
  const end     = new Date(start.getTime() + 90 * 60_000)
  return {
    title:    training.name,
    start,
    end,
    resource: { training, count },
  }
}

// Evento con asistencias: gradiente del tema
// Evento sin asistencias: ámbar/naranja (llama la atención)
const eventStyleGetter = ({ resource }) => {
  const hasAttendances = resource.count > 0
  return {
    style: {
      background: hasAttendances
        ? 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)'
        : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      border:       'none',
      borderRadius: '8px',
      color:        '#fff',
      fontSize:     '0.78rem',
      fontWeight:   '600',
      padding:      '2px 7px',
      cursor:       'pointer',
      boxShadow:    hasAttendances
        ? '0 4px 12px -4px rgba(99,102,241,0.55)'
        : '0 4px 12px -4px rgba(245,158,11,0.45)',
    },
  }
}

// Badge de estado para cada asistente
const statusBadge = (status) => {
  const map = {
    Verificado: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    Pendiente:  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20  text-amber-300  border border-amber-500/30',
    Ausente:    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20    text-red-300    border border-red-500/30',
  }
  return <span className={map[status] ?? map.Pendiente}>{status}</span>
}

// ─── Component ───────────────────────────────────────────────────────────────
export function AttendancesAdminView() {
  const [trainings,    setTrainings]    = useState([])
  const [attendances,  setAttendances]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [selected,     setSelected]     = useState(null)   // { training, count, rows }
  const [view,         setView]         = useState(Views.MONTH)
  const [date,         setDate]         = useState(new Date())

  // ── Carga paralela de entrenamientos + asistencias ───────────────────────
  useEffect(() => {
    let alive = true
    const boot = async () => {
      setLoading(true)
      setError('')
      try {
        const [t, a] = await Promise.all([
          trainingController.getAll().catch(() => []),
          attendanceController.getAll().catch(() => []),
        ])
        if (!alive) return
        setTrainings(Array.isArray(t) ? t : [])
        setAttendances(Array.isArray(a) ? a : [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'No se pudo cargar la información')
      } finally {
        if (alive) setLoading(false)
      }
    }
    boot()
    return () => { alive = false }
  }, [])

  // ── Agrupar asistencias por training ────────────────────────────────────
  const attendanceMap = useMemo(() => {
    const map = {}
    for (const row of attendances) {
      const key = String(row.id_training)
      if (!map[key]) map[key] = []
      map[key].push(row)
    }
    return map
  }, [attendances])

  // ── Eventos del calendario ───────────────────────────────────────────────
  const events = useMemo(() => trainings.map((t) => {
    const rows = attendanceMap[String(t.id_training)] ?? []
    return toEvent(t, rows.length)
  }), [trainings, attendanceMap])

  // ── Selección de evento ──────────────────────────────────────────────────
  const onSelectEvent = useCallback((event) => {
    const { training } = event.resource
    const rows = attendanceMap[String(training.id_training)] ?? []
    setSelected({ training, count: rows.length, rows })
  }, [attendanceMap])

  const closeModal = useCallback(() => setSelected(null), [])

  // ── Leyenda ──────────────────────────────────────────────────────────────
  const Legend = () => (
    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg,#6366f1,#d946ef)' }} />
        Con asistencias
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }} />
        Sin asistencias registradas
      </span>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-4">
      <PageHeader
        title="Asistencias"
        subtitle="Vista de calendario. Los eventos con asistencias aparecen en índigo; sin registros, en ámbar."
        icon={icons.attendances}
      />

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <Legend />
          <span className="text-xs text-neutral-400">
            Haz clic en un entrenamiento para ver sus asistentes.
          </span>
        </div>

        {loading ? (
          <div className="text-neutral-400 py-10 text-center">Cargando datos...</div>
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

      {/* ── Modal asistentes ──────────────────────────────────────────── */}
      <Modal
        open={Boolean(selected)}
        title={selected?.training?.name ?? 'Entrenamiento'}
        onClose={closeModal}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              to={`/attendances/training/${selected?.training?.id_training}`}
              onClick={closeModal}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 text-white text-sm font-medium"
            >
              <span>{icons.attendances}</span>
              <span>Ver detalle completo</span>
            </Link>
            <Button variant="secondary" onClick={closeModal}>Cerrar</Button>
          </div>
        }
      >
        {selected ? (
          <div className="grid gap-4">
            {/* Info del entrenamiento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Fecha',     value: String(selected.training.date  ?? '').slice(0, 10) },
                { label: 'Hora',      value: String(selected.training.time  ?? '').slice(0, 5)  },
                { label: 'Lugar',     value: selected.training.location ?? '—' },
                { label: 'Asistentes', value: String(selected.count) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <div className="text-xs text-neutral-400 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-neutral-100">{value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Lista de asistentes */}
            {selected.rows.length === 0 ? (
              <div className="text-neutral-400 text-sm text-center py-4">
                No hay asistencias registradas para este entrenamiento.
              </div>
            ) : (
              <DataTable
                rows={selected.rows}
                getRowKey={(row) => row.id_attendance}
                emptyText="Sin asistentes"
                columns={[
                  {
                    key: 'athlete',
                    label: 'Deportista',
                    render: (row) => `${row?.athlete_name ?? ''} ${row?.athlete_lastname ?? ''}`.trim(),
                  },
                  {
                    key: 'status',
                    label: 'Estado',
                    render: (row) => statusBadge(row.status),
                  },
                  {
                    key: 'created_at',
                    label: 'Registrado',
                    render: (row) => {
                      const d = new Date(row?.created_at)
                      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('es-CO')
                    },
                  },
                ]}
              />
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
