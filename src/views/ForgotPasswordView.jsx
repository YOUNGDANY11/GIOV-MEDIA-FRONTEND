import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { icons } from '../components/ui/icons'
import { authController } from '../controllers/authController'

export function ForgotPasswordView() {
  const navigate = useNavigate()
  const [step, setStep]           = useState(1)
  const [ttl, setTtl]             = useState(3)
  const [document, setDocument]   = useState('')
  const [email, setEmail]         = useState('')
  const [code, setCode]           = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSendCode = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await authController.forgotPassword(document)
      if (res.minutos) setTtl(res.minutos)
      setStep(2)
    } catch (err) {
      setError(err?.message || 'No se pudo enviar el código')
    } finally {
      setSubmitting(false)
    }
  }

  const onResetPassword = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await authController.resetPassword(email, code, newPassword)
      navigate('/login', { replace: true, state: { passwordReset: true } })
    } catch (err) {
      setError(err?.message || 'No se pudo restablecer la contraseña')
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
                <span className="opacity-80" aria-hidden="true">{icons.user}</span>
                <span>{step === 1 ? 'Recuperar contraseña' : 'Restablecer contraseña'}</span>
              </div>
            </div>

            {step === 1 ? (
              <form className="stack mt-4" onSubmit={onSendCode}>
                {error ? <Alert type="error">{error}</Alert> : null}
                <p className="text-sm text-neutral-400">
                  Ingresa tu número de documento y te enviaremos un código de verificación a tu correo.
                </p>
                <Input
                  label="Documento"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar código'}
                </Button>
              </form>
            ) : (
              <form className="stack mt-4" onSubmit={onResetPassword}>
                {error ? <Alert type="error">{error}</Alert> : null}
                <p className="text-sm text-neutral-400">
                  Si el documento está registrado, se envió un código de {ttl} minutos a tu correo. Ingrésalo junto con tu nueva contraseña.
                </p>
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Código de verificación"
                  placeholder="6 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  hint="Mínimo 8 caracteres"
                  required
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Restableciendo...' : 'Restablecer contraseña'}
                </Button>
                <button
                  type="button"
                  className="text-sm text-neutral-400 hover:text-white underline underline-offset-4 text-center"
                  onClick={() => { setStep(1); setError('') }}
                >
                  Volver a ingresar documento
                </button>
              </form>
            )}

            <div className="auth-links">
              <Link className="underline underline-offset-4 hover:text-white" to="/login">Volver al ingreso</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
