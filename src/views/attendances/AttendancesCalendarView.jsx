import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { trainingController } from '../../controllers/trainingController'
import { icons } from '../../components/ui/icons'
import { AttendanceQrModal } from './AttendanceQrModal'

const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const toDate = (value) => {
  const text = String(value ?? '').slice(0, 10)
  if (!text) return { day: '--', month: '---', year: '' }
  const parsed = new Date(`${text}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return { day: text.slice(8, 10), month: '', year: text.slice(0, 4) }
  return { day: String(parsed.getDate()).padStart(2, '0'), month: months[parsed.getMonth()] || '', year: String(parsed.getFullYear()) }
}

export function AttendancesCalendarView({ hideHeader = false }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let alive = true

    const boot = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await trainingController.getAll()
        if (!alive) return
        setRows(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'No se pudo cargar el calendario')
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [])

  const ordered = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ax = `${String(a?.date ?? '').slice(0, 10)}T${String(a?.time ?? '00:00:00')}`
      const bx = `${String(b?.date ?? '').slice(0, 10)}T${String(b?.time ?? '00:00:00')}`
      return bx.localeCompare(ax)
    })
  }, [rows])

  return (
    <div className="flex flex-col gap-4">
      {!hideHeader ? (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold tracking-tight">Agenda de asistencias</div>
              <div className="text-neutral-300">Selecciona un entrenamiento para generar su QR.</div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/attendances/list" className="inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5">Asistencias</Link>
            </div>
          </div>
        </Card>
      ) : null}

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="text-neutral-400">Cargando...</div>
        ) : ordered.length === 0 ? (
          <div className="text-neutral-400">No hay entrenamientos registrados</div>
        ) : (
          <div className="flex flex-col gap-3">
            {ordered.map((training) => {
              const date = toDate(training?.date)
              return (
                <div key={training.id_training} className="flex items-center gap-4 p-3 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
                  <div className="w-20 grid place-items-center p-2 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-lg font-extrabold">{date.day}</div>
                    <div className="text-sm text-neutral-400">{date.month}{date.year ? ` ${date.year}` : ''}</div>
                  </div>

                  <div className="flex-1">
                    <div className="font-extrabold text-base">{training?.name}</div>
                    <div className="text-neutral-300 mt-1">{training?.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/20 text-sm text-neutral-200">{String(training?.time ?? '').slice(0, 5)}</span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/20 text-sm text-neutral-200">{training?.location}</span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/20 text-sm text-neutral-200">Entrenamiento</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="secondary" icon={icons.scan} onClick={() => { setSelected(training); setOpen(true) }}>QR</Button>
                    <Link className="inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5" to={`/attendances/training/${training.id_training}`}>Asistencias</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <AttendanceQrModal open={open} training={selected} onClose={() => { setOpen(false); setSelected(null) }} />
    </div>
  )
}
