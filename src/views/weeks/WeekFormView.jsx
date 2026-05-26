import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { FormActions } from '../../components/crud/FormActions'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { weekController } from '../../controllers/weekController'
import { icons } from '../../components/ui/icons'

export function WeekFormView() {
  const navigate = useNavigate()
  const [loading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', delivery_date: '', start_time: '', end_time: '' })

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await weekController.create(form)
      navigate('/weeks', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader title="Nueva semana" subtitle="Define el rango de entrega para media." icon={icons.calendar} />
      {error ? <Alert type="error">{error}</Alert> : null}
      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <Input label="Nombre" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <div className="grid-3">
              <Input label="Fecha de entrega" type="date" value={form.delivery_date} onChange={(e) => setForm((prev) => ({ ...prev, delivery_date: e.target.value }))} required />
              <Input label="Hora inicio" type="time" value={form.start_time} onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))} required />
              <Input label="Hora fin" type="time" value={form.end_time} onChange={(e) => setForm((prev) => ({ ...prev, end_time: e.target.value }))} required />
            </div>
            <FormActions submitting={submitting} cancelTo="/weeks" />
          </form>
        )}
      </Card>
    </div>
  )
}
