import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { distanciaMetros, obtenerPosicion } from '../../utils/geo'
import { QrCameraScanner } from './QrCameraScanner'

const WINDOW_MINUTES = Number(import.meta.env.VITE_ATTENDANCE_WINDOW_MINUTES || 40)
const RADIO_METROS = Number(import.meta.env.VITE_ATTENDANCE_RADIUS_METERS || 200)

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
  const [scanError, setScanError] = useState('')
  const [geoError, setGeoError] = useState('')
  const [training, setTraining] = useState(null)
  const [coords, setCoords] = useState(null)
  const [now, setNow] = useState(() => new Date())
  const scanHandledRef = useRef(false)

  const search = useMemo(() => new URLSearchParams(location.search), [location.search])
  const trainingId = useMemo(() => Number(search.get('trainingId') || 0), [search])
  const status = useMemo(() => search.get('status') || 'Verificado', [search])

  const start = useMemo(() => parseStart(training), [training])
  const end = useMemo(() => (start ? new Date(start.getTime() + WINDOW_MINUTES * 60_000) : null), [start])
  const isWithinWindow = Boolean(start && end && now >= start && now <= end)
  const trainingLat = useMemo(() => {
    const value = training?.lat
    if (value === '' || value === null || value === undefined) return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
  }, [training])
  const trainingLng = useMemo(() => {
    const value = training?.lng
    if (value === '' || value === null || value === undefined) return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
  }, [training])
  const hasTrainingCoords = trainingLat !== null && trainingLng !== null
  const distanceMeters = useMemo(() => {
    if (!hasTrainingCoords || !coords) return null
    return distanciaMetros(coords.lat, coords.lng, trainingLat, trainingLng)
  }, [coords, hasTrainingCoords, trainingLat, trainingLng])
  const isWithinRange = !hasTrainingCoords || (distanceMeters !== null && distanceMeters <= RADIO_METROS)

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
    if (!isAuthenticated || !trainingId) return

    setError('')
    setSuccess('')
    setGeoError('')
    setCoords(null)
    setLoading(true)

    try {
      const currentTraining = await trainingController.getById(trainingId)
      if (!currentTraining) {
        setError('No se encontró el entrenamiento asociado al QR.')
        setTraining(null)
        return
      }

      setTraining(currentTraining)
      try {
        const position = await obtenerPosicion()
        setCoords(position)
      } catch (geoErr) {
        setCoords(null)
        setGeoError(geoErr?.message || 'No se pudo obtener tu ubicación.')
      }
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el QR')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, trainingId])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) return

    if (!isAthlete(user?.id_role)) {
      setError('Esta página solo está disponible para deportistas.')
      setLoading(false)
      return
    }

    if (!trainingId) {
      setLoading(false)
      return
    }

    boot()
  }, [authLoading, isAuthenticated, trainingId, user?.id_role, boot])

  const handleDecode = useCallback((text) => {
    if (scanHandledRef.current) return

    let parsedTrainingId = ''
    let parsedStatus = 'Verificado'

    try {
      const url = new URL(text, window.location.origin)
      parsedTrainingId = url.searchParams.get('trainingId') || ''
      parsedStatus = url.searchParams.get('status') || 'Verificado'
    } catch {
      // no era una URL válida
    }

    if (!parsedTrainingId || !Number(parsedTrainingId)) {
      setScanError('El código QR escaneado no corresponde a un entrenamiento válido.')
      return
    }

    scanHandledRef.current = true
    setScanError('')
    navigate(`/attendance/scan?trainingId=${parsedTrainingId}&status=${encodeURIComponent(parsedStatus)}`, { replace: true })
  }, [navigate])

  const handleScanError = useCallback((message) => {
    setScanError(message)
  }, [])

  const retryLocation = useCallback(async () => {
    setGeoError('')

    try {
      const position = await obtenerPosicion()
      setCoords(position)
    } catch (geoErr) {
      setCoords(null)
      setGeoError(geoErr?.message || 'No se pudo obtener tu ubicación.')
    }
  }, [])

  useEffect(() => {
    if (!trainingId) scanHandledRef.current = false
  }, [trainingId])

  const onRegister = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      await attendanceController.create({
        id_training: Number(trainingId),
        status,
        lat: coords?.lat,
        lng: coords?.lng,
      })
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
        ) : !trainingId && !error ? (
          <div className="stack" style={{ marginTop: 16 }}>
            {scanError ? <Alert type="error">{scanError}</Alert> : null}
            <p className="muted">Apunta la cámara al código QR generado para el entrenamiento.</p>
            <QrCameraScanner onDecode={handleDecode} onError={handleScanError} />
          </div>
        ) : (
          <div className="stack" style={{ marginTop: 16 }}>
            <Input label="Entrenamiento" value={training?.name ?? ''} readOnly />
            <Input label="Fecha" value={toDate(training?.date)} readOnly />
            <Input label="Hora" value={toTime(training?.time)} readOnly />
            <Input label="Lugar" value={training?.location ?? ''} readOnly />

            {geoError ? <Alert type="error">{geoError}</Alert> : null}

            {!isWithinWindow ? (
              <Alert type="warning">Este QR está fuera de la ventana de tiempo del entrenamiento.</Alert>
            ) : null}

            {hasTrainingCoords && !isWithinRange ? (
              <Alert type="warning">
                Estás fuera del rango permitido. Distancia actual: {distanceMeters !== null ? `${distanceMeters.toFixed(0)} metros` : 'no disponible'}.
                El radio permitido es de {RADIO_METROS} metros.
              </Alert>
            ) : null}

            <div className="toolbar" style={{ marginTop: 4 }}>
              <Link to="/attendance/scan" className="btn secondary" onClick={() => setTraining(null)}>Escanear otro QR</Link>
              <Button type="button" disabled={submitting || !trainingId || !isWithinWindow || !isWithinRange} onClick={onRegister}>
                {submitting ? 'Registrando...' : 'Registrar asistencia'}
              </Button>
            </div>

            {(geoError || !isWithinRange) ? (
              <div>
                <Button type="button" variant="secondary" onClick={retryLocation}>
                  Reintentar ubicación
                </Button>
              </div>
            ) : null}

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
