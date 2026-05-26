import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { icons } from '../components/ui/icons'
import { useAuth } from '../context/AuthContext'

export function LoginView() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ document: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card w-full max-w-md">
        <div className="auth-heading">
          <div className="text-3xl sm:text-4xl font-semibold tracking-wide">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-100 to-neutral-300">G10V</span>
          </div>
          <div className="mt-1 text-sm text-neutral-400">Gestión integral de organización deportiva</div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
          <div className="relative">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-neutral-200/90">
                <span className="opacity-80" aria-hidden="true">{icons.dashboard}</span>
                <span>Acceso al sistema</span>
              </div>
            </div>

          <form className="stack" onSubmit={onSubmit}>
            {error ? <Alert type="error">{error}</Alert> : null}
            <Input label="Documento" value={form.document} onChange={(e) => setForm((prev) => ({ ...prev, document: e.target.value }))} required />
            <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
            <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Ingresando...' : 'Ingresar'}</Button>
          </form>

          <div className="auth-links">
            <Link className="underline underline-offset-4 hover:text-white" to="/register">Crear cuenta</Link>
          </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
