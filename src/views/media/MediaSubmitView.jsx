import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { FormActions } from '../../components/crud/FormActions'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { mediaController } from '../../controllers/mediaController'
import { weekController } from '../../controllers/weekController'
import { icons } from '../../components/ui/icons'

const formatWeekLabel = (week) => {
  const date      = String(week?.delivery_date ?? '').slice(0, 10)
  const startTime = String(week?.start_time ?? '').slice(0, 5)
  const endTime   = String(week?.end_time   ?? '').slice(0, 5)
  return `${week?.name ?? 'Semana'} | ${date} | ${startTime} - ${endTime}`
}

const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Barra de progreso ────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-xs text-neutral-400">
        <span>Subiendo video…</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function MediaSubmitView() {
  const navigate = useNavigate()

  const [weeks,       setWeeks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [submitting,  setSubmitting]  = useState(false)
  const [progress,    setProgress]    = useState(0)       // 0-100
  const [statusMsg,   setStatusMsg]   = useState('')      // texto de estado
  const [error,       setError]       = useState('')
  const [form,        setForm]        = useState({ id_week: '', video: null })
  const [refreshTick, setRefreshTick] = useState(0)

  // Cargar semanas activas
  useEffect(() => {
    let alive = true
    const boot = async () => {
      try {
        const data = await weekController.getActive().catch(() => [])
        if (!alive) return
        setWeeks(Array.isArray(data) ? data : [])
      } catch (err) {
        if (alive) setError(err?.message || 'No se pudieron cargar las semanas')
      } finally {
        if (alive) setLoading(false)
      }
    }
    boot()
    return () => { alive = false }
  }, [refreshTick])

  // Refrescar semanas cada 30 s (la ventana puede abrirse/cerrarse)
  useEffect(() => {
    const timer = window.setInterval(() => setRefreshTick((t) => t + 1), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.video || !form.id_week) return

    setSubmitting(true)
    setProgress(0)
    setStatusMsg('Preparando subida…')
    setError('')

    try {
      await mediaController.submit(
        { id_week: form.id_week, file: form.video },
        (pct) => {
          setProgress(pct)
          if (pct < 100) setStatusMsg(`Subiendo video… ${pct}%`)
          else setStatusMsg('Registrando entrega…')
        },
      )
      navigate('/media/mine', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo enviar el video')
    } finally {
      setSubmitting(false)
      setStatusMsg('')
    }
  }

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Subir video"
        subtitle="Entrega un video dentro del rango habilitado por semana."
        icon={icons.upload}
      />

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="text-neutral-400 py-8 text-center">Cargando…</div>
        ) : (
          <form className="grid gap-5" onSubmit={onSubmit}>
            <Select
              label="Semana habilitada"
              hint={
                weeks.length > 0
                  ? `Solo se muestran las semanas activas ahora mismo (${weeks.length}).`
                  : 'No hay semanas habilitadas en este momento.'
              }
              required
              value={form.id_week}
              onChange={(e) => setForm((prev) => ({ ...prev, id_week: e.target.value }))}
              disabled={submitting}
            >
              <option value="">-- Selecciona --</option>
              {weeks.map((week) => (
                <option key={week.id_week} value={String(week.id_week)}>
                  {formatWeekLabel(week)}
                </option>
              ))}
            </Select>

            {weeks.length === 0 ? (
              <Alert type="warning">
                No hay semanas habilitadas para subir video en este momento.
              </Alert>
            ) : null}

            {/* Selector de archivo personalizado */}
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-neutral-300">Video</label>
              <label
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition
                  ${submitting
                    ? 'opacity-50 pointer-events-none border-white/10'
                    : form.video
                      ? 'border-indigo-500/60 bg-indigo-500/5'
                      : 'border-white/15 hover:border-indigo-500/50 hover:bg-white/3'
                  }`}
              >
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  required={weeks.length > 0}
                  disabled={submitting || weeks.length === 0}
                  onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.files?.[0] ?? null }))}
                />
                <span className="text-2xl text-neutral-400">{icons.upload}</span>
                {form.video ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-200 break-all">{form.video.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatBytes(form.video.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-neutral-300">Haz clic para seleccionar un video</p>
                    <p className="text-xs text-neutral-500 mt-0.5">MP4, MOV, AVI, etc. · Sin límite de tamaño</p>
                  </div>
                )}
              </label>
            </div>

            {/* Barra de progreso (visible durante subida) */}
            {submitting ? (
              <div className="grid gap-3">
                <ProgressBar pct={progress} />
                {statusMsg ? (
                  <p className="text-xs text-neutral-400 text-center">{statusMsg}</p>
                ) : null}
              </div>
            ) : null}

            <FormActions
              submitting={submitting}
              cancelTo="/media/mine"
              submitLabel={submitting ? statusMsg || 'Subiendo…' : 'Enviar video'}
            />
          </form>
        )}
      </Card>
    </div>
  )
}
