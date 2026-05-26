import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { FormActions } from '../../components/crud/FormActions'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { trainingController } from '../../controllers/trainingController'
import { icons } from '../../components/ui/icons'

const blank = { name: '', description: '', date: '', time: '', location: '' }

export function TrainingFormView({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = mode === 'edit'
  const [loading, setLoading] = useState(editing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(blank)

  useEffect(() => {
    let alive = true

    const boot = async () => {
      if (!editing) return setLoading(false)
      try {
        const training = await trainingController.getById(id)
        if (!alive) return
        setForm({
          name: training?.name ?? '',
          description: training?.description ?? '',
          date: String(training?.date ?? '').slice(0, 10),
          time: String(training?.time ?? '').slice(0, 5),
          location: training?.location ?? '',
        })
      } catch (err) {
        if (alive) setError(err?.message || 'No se pudo cargar el entrenamiento')
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [editing, id])

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (editing) {
        await trainingController.update(id, form)
      } else {
        await trainingController.create(form)
      }

      navigate('/trainings', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title={editing ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}
        subtitle="Administra fecha, hora y ubicación del entrenamiento."
        icon={icons.trainings}
        actions={<Link to="/trainings" className="btn secondary">Volver</Link>}
      />

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <Input label="Nombre" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <Input as="textarea" label="Descripción" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
            <div className="grid-3">
              <Input label="Fecha" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
              <Input label="Hora" type="time" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} required />
              <Input label="Ubicación" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} required />
            </div>
            <FormActions submitting={submitting} cancelTo="/trainings" />
          </form>
        )}
      </Card>
    </div>
  )
}
