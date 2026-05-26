import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { FormActions } from '../../components/crud/FormActions'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { userController } from '../../controllers/userController'
import { icons } from '../../components/ui/icons'

export function UserFormView({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const editing = mode === 'edit'
  const [loading, setLoading] = useState(editing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', lastname: '', document: '', email: '', password: '', id_role: '2' })

  useEffect(() => {
    let alive = true

    const boot = async () => {
      if (!editing) return setLoading(false)
      try {
        const user = await userController.getById(id)
        if (!alive) return
        setForm({
          name: user?.name ?? '',
          lastname: user?.lastname ?? '',
          document: user?.document ?? '',
          email: user?.email ?? '',
          password: '',
          id_role: String(user?.id_role ?? '2'),
        })
      } catch (err) {
        if (alive) setError(err?.message || 'No se pudo cargar el usuario')
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
      const payload = {
        name: form.name,
        lastname: form.lastname,
        document: form.document,
        email: form.email,
        id_role: Number(form.id_role),
      }

      if (editing) {
        await userController.update(id, payload)
      } else {
        await userController.create({ ...payload, password: form.password })
      }

      navigate('/users', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="stack">
      <PageHeader
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        subtitle="Formulario de administración de cuentas."
        icon={icons.users}
        actions={<Link to="/users" className="btn secondary">Volver</Link>}
      />

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : (
          <form className="stack" onSubmit={onSubmit}>
            <div className="grid-2">
              <Input label="Nombre" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <Input label="Apellido" value={form.lastname} onChange={(e) => setForm((prev) => ({ ...prev, lastname: e.target.value }))} required />
            </div>
            <div className="grid-2">
              <Input label="Documento" value={form.document} onChange={(e) => setForm((prev) => ({ ...prev, document: e.target.value }))} required />
              <Input label="Correo" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
            </div>
            {!editing ? <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required /> : null}
            <Select label="Rol" value={form.id_role} onChange={(e) => setForm((prev) => ({ ...prev, id_role: e.target.value }))}>
              <option value="1">Administrador</option>
              <option value="2">Deportista</option>
            </Select>
            <FormActions submitting={submitting} cancelTo="/users" />
          </form>
        )}
      </Card>
    </div>
  )
}
