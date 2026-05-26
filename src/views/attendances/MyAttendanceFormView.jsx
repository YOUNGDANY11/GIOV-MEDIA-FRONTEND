import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { FormActions } from '../../components/crud/FormActions'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { attendanceController } from '../../controllers/attendanceController'
import { trainingController } from '../../controllers/trainingController'
import { icons } from '../../components/ui/icons'

export function MyAttendanceFormView() {
  const navigate = useNavigate()
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id_training: '', status: 'Verificado' })

  useEffect(() => {
    let alive = true

    const boot = async () => {
      try {
        const data = await trainingController.getAll().catch(() => [])
        if (!alive) return
        setTrainings(Array.isArray(data) ? data : [])
      } catch (err) {
        if (alive) setError(err?.message || 'No se pudo cargar la información')
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [])

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await attendanceController.create({ id_training: Number(form.id_training), status: form.status })
      navigate('/my-attendances', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo registrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader title="Registrar asistencia" subtitle="Selecciona un entrenamiento y confirma tu asistencia." icon={icons.attendances} />

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <Select label="Entrenamiento" required value={form.id_training} onChange={(e) => setForm((prev) => ({ ...prev, id_training: e.target.value }))}>
              <option value="">-- Selecciona --</option>
              {trainings.map((training) => (
                <option key={training.id_training} value={String(training.id_training)}>
                  {training.name} - {String(training.date).slice(0, 10)} {String(training.time).slice(0, 5)} ({training.location})
                </option>
              ))}
            </Select>

            <Select label="Estado" required value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              <option value="Verificado">Verificado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Ausente">Ausente</option>
            </Select>

            <FormActions submitting={submitting} cancelTo="/my-attendances" />
          </form>
        )}
      </Card>
    </div>
  )
}
