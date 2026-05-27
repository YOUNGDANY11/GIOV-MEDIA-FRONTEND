import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/Alert'
import { Input } from '../../components/ui/Input'
import { attendanceController } from '../../controllers/attendanceController'
import { trainingController } from '../../controllers/trainingController'
import { isAthlete } from '../../utils/roles'
import { formatBogotaDateTime, parseBogotaDateTime } from '../../utils/bogotaTime'

const WINDOW_MINUTES = Number(import.meta.env.VITE_ATTENDANCE_WINDOW_MINUTES || 40)

const toDate = (value) => String(value ?? '').slice(0, 10)
const toTime = (value) => String(value ?? '').slice(0, 5)

const parseStart = (training) => {
  return parseBogotaDateTime(training?.date, training?.time)
}

export function AttendanceScanView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loading: authLoading, isAuthenticated, user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [training, setTraining] = useState(null)
  const [now, setNow] = useState(() => new Date())

  const search = useMemo(() => new URLSearchParams(location.search), [location.search])
  const trainingId = useMemo(() => Number(search.get('trainingId') || 0), [search])
  const status = useMemo(() => search.get('status') || 'Verificado', [search])

  const start = useMemo(() => parseStart(training), [training])
  const end = useMemo(() => (start ? new Date(start.getTime() + WINDOW_MINUTES * 60_000) : null), [start])
  const isWithinWindow = Boolean(start && end && now >= start && now <= end)

  useEffect(() => {
    if (!isAuthenticated) return undefined

    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [isAuthenticated, trainingId])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  const boot = useCallback(async () => {
    if (!isAuthenticated) return

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!isAthlete(user?.id_role)) {
        setError('Esta página solo está disponible para deportistas.')
        setTraining(null)
        return
      }

      if (!trainingId) {
        setError('QR inválido: falta trainingId.')
        return
      }

      const currentTraining = await trainingController.getById(trainingId)
      if (!currentTraining) {
        setError('No se encontró el entrenamiento asociado al QR.')
        setTraining(null)
        return
      }

      setTraining(currentTraining)
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el QR')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, trainingId, user?.id_role])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) return
    boot()
  }, [authLoading, isAuthenticated, boot])

  const onRegister = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await attendanceController.create({ id_training: Number(trainingId), status })
      setSuccess('Asistencia registrada con éxito.')
      setTimeout(() => {
        navigate('/my-attendances', { replace: true })
      }, 900)
    } catch (err) {
      setError(err?.message || 'No se pudo registrar la asistencia')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return <div className="auth-shell"><div className="panel">Cargando...</div></div>
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <div className="toolbar">
          <div>
            <h1 style={{ margin: 0 }}>Registro de asistencia</h1>
            <p className="muted">Confirma tu asistencia para el entrenamiento.</p>
          </div>
          <Link to="/dashboard" className="btn secondary">Ir al dashboard</Link>
        </div>

        {error ? <div style={{ marginTop: 12 }}><Alert type="error">{error}</Alert></div> : null}
        {success ? <div style={{ marginTop: 12 }}><Alert type="success">{success}</Alert></div> : null}

        {loading ? (
          <div className="muted" style={{ marginTop: 16 }}>Cargando...</div>
        ) : (
          <div className="stack" style={{ marginTop: 16 }}>
            <Input label="Entrenamiento" value={training?.name ?? ''} readOnly />
            <Input label="Fecha" value={toDate(training?.date)} readOnly />
            <Input label="Hora" value={toTime(training?.time)} readOnly />
            <Input label="Lugar" value={training?.location ?? ''} readOnly />

            {!isWithinWindow ? (
              <Alert type="warning">Este QR está fuera de la ventana de tiempo del entrenamiento.</Alert>
            ) : null}

            <div className="toolbar" style={{ marginTop: 4 }}>
              <div />
              <Button type="button" disabled={submitting || !trainingId || !isWithinWindow} onClick={onRegister}>
                {submitting ? 'Registrando...' : 'Registrar asistencia'}
              </Button>
            </div>

            {start && end ? (
              <div className="footer-note">
                Ventana: {formatBogotaDateTime(start, { dateStyle: 'medium', timeStyle: 'short' })} — {formatBogotaDateTime(end, { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  )
}
