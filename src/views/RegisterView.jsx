import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { icons } from '../components/ui/icons'
import { useAuth } from '../context/AuthContext'

export function RegisterView() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', lastname: '', document: '', email: '', password: '', id_role: '2',
  })

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await register({ ...form, id_role: Number(form.id_role) })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo registrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card w-full max-w-2xl">
        <div className="auth-heading">
          <div className="text-3xl sm:text-4xl font-semibold tracking-wide">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-100 to-neutral-300">Crear cuenta</span>
          </div>
          <div className="mt-1 text-sm text-neutral-400">El registro queda listo para entrar al sistema con el rol asignado.</div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
          <div className="relative">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-200/90">
                <span className="opacity-80" aria-hidden="true">{icons.users}</span>
                <span>Nuevo usuario</span>
              </div>
            </div>

          <form className="stack" onSubmit={onSubmit}>
            {error ? <Alert type="error">{error}</Alert> : null}
            <div className="grid-2">
              <Input label="Nombre" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <Input label="Apellido" value={form.lastname} onChange={(e) => setForm((prev) => ({ ...prev, lastname: e.target.value }))} required />
            </div>
            <div className="grid-2">
              <Input label="Documento" value={form.document} onChange={(e) => setForm((prev) => ({ ...prev, document: e.target.value }))} required />
              <Input label="Correo" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
            </div>
            <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
            <Select label="Rol" value={form.id_role} onChange={(e) => setForm((prev) => ({ ...prev, id_role: e.target.value }))}>
              <option value="2">Deportista</option>
            </Select>
            <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Registrando...' : 'Registrarme'}</Button>
          </form>

          <div className="auth-links">
            <Link className="underline underline-offset-4 hover:text-white" to="/login">Volver al ingreso</Link>
          </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
