import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { FormActions } from '../../components/crud/FormActions'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { mediaController } from '../../controllers/mediaController'
import { weekController } from '../../controllers/weekController'
import { icons } from '../../components/ui/icons'

const formatWeekLabel = (week) => {
  const date = String(week?.delivery_date ?? '').slice(0, 10)
  const startTime = String(week?.start_time ?? '').slice(0, 5)
  const endTime = String(week?.end_time ?? '').slice(0, 5)
  return `${week?.name ?? 'Semana'} | ${date} | ${startTime} - ${endTime}`
}

export function MediaSubmitView() {
  const navigate = useNavigate()
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id_week: '', video: null })
  const [refreshTick, setRefreshTick] = useState(0)

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
    return () => {
      alive = false
    }
  }, [refreshTick])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRefreshTick((current) => current + 1)
    }, 30000)

    return () => window.clearInterval(timer)
  }, [])

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const payload = new FormData()
      payload.append('id_week', String(form.id_week))
      payload.append('video', form.video)
      await mediaController.submit(payload)
      navigate('/media/mine', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo enviar el video')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader title="Subir video" subtitle="Entrega un video dentro del rango habilitado por semana." icon={icons.upload} />
      {error ? <Alert type="error">{error}</Alert> : null}
      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <Select
              label="Semana habilitada"
              hint={weeks.length > 0
                ? `Solo se muestran las semanas activas ahora mismo (${weeks.length}).`
                : 'No hay semanas habilitadas en este momento.'}
              required
              value={form.id_week}
              onChange={(e) => setForm((prev) => ({ ...prev, id_week: e.target.value }))}
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
                No hay semanas habilitadas para subir video en este momento. La ventana depende del día y horario definidos en el backend.
              </Alert>
            ) : null}

            <Input
              label="Video"
              type="file"
              accept="video/*"
              onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.files?.[0] ?? null }))}
              required={weeks.length > 0}
              disabled={weeks.length === 0}
            />

            <FormActions submitting={submitting} cancelTo="/media/mine" submitLabel="Enviar video" />
          </form>
        )}
      </Card>
    </div>
  )
}
