import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { attendanceController } from '../../controllers/attendanceController'
import { trainingController } from '../../controllers/trainingController'
import { formatBogotaDateTime, parseBogotaDateTime } from '../../utils/bogotaTime'
import { distanciaMetros, obtenerPosicion } from '../../utils/geo'

const WINDOW_MINUTES = Number(import.meta.env.VITE_ATTENDANCE_WINDOW_MINUTES || 40)

const toDate = (value) => String(value ?? '').slice(0, 10)
const toTime = (value) => String(value ?? '').slice(0, 5)

const normalizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function MyAttendancesView() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [geoError, setGeoError] = useState('')
  const [trainings, setTrainings] = useState([])
  const [historyRows, setHistoryRows] = useState([])
  const [coords, setCoords] = useState(null)
  const [now, setNow] = useState(() => new Date())

  const radioMetros = Number(import.meta.env.VITE_ATTENDANCE_RADIUS_METERS || 200)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let alive = true

    const boot = async () => {
      setLoading(true)
      setError('')
      setGeoError('')

      try {
        const [allTrainings, mineAttendances] = await Promise.all([
          trainingController.getAll().catch(() => []),
          attendanceController.getMine().catch(() => []),
        ])

        if (!alive) return

        setTrainings(Array.isArray(allTrainings) ? allTrainings : [])
        setHistoryRows(Array.isArray(mineAttendances) ? mineAttendances : [])

        try {
          const position = await obtenerPosicion()
          if (!alive) return
          setCoords(position)
        } catch (geoErr) {
          if (!alive) return
          setCoords(null)
          setGeoError(geoErr?.message || 'No se pudo obtener tu ubicación.')
        }
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'No se pudieron cargar las asistencias')
        setTrainings([])
        setHistoryRows([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [])

  const orderedTrainings = useMemo(() => {
    return [...trainings].sort((a, b) => {
      const ax = `${toDate(a?.date)}T${String(a?.time ?? '00:00:00')}`
      const bx = `${toDate(b?.date)}T${String(b?.time ?? '00:00:00')}`
      return bx.localeCompare(ax)
    })
  }, [trainings])

  const activeTrainings = useMemo(() => {
    return orderedTrainings.filter((training) => {
      const start = parseBogotaDateTime(training?.date, training?.time)
      const end = start ? new Date(start.getTime() + WINDOW_MINUTES * 60_000) : null
      return Boolean(start && end && now >= start && now <= end)
    })
  }, [now, orderedTrainings])

  const visibleTrainings = useMemo(() => {
    return activeTrainings.filter((training) => {
      const lat = normalizeNumber(training?.lat)
      const lng = normalizeNumber(training?.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !coords) return false

      const distance = distanciaMetros(coords.lat, coords.lng, lat, lng)
      return distance <= radioMetros
    })
  }, [activeTrainings, coords, radioMetros])

  const getTrainingRangeInfo = useCallback((training) => {
    const start = parseBogotaDateTime(training?.date, training?.time)
    const end = start ? new Date(start.getTime() + WINDOW_MINUTES * 60_000) : null
    const withinWindow = Boolean(start && end && now >= start && now <= end)

    const lat = normalizeNumber(training?.lat)
    const lng = normalizeNumber(training?.lng)

    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
    if (!hasCoords || !coords) {
      return { training, hasCoords, distance: null, withinRange: !hasCoords, withinWindow, start, end }
    }

    const distance = distanciaMetros(coords.lat, coords.lng, lat, lng)
    return { training, hasCoords, distance, withinRange: distance <= radioMetros, withinWindow, start, end }
  }, [coords, now, radioMetros])

  const openAttendanceScan = useCallback((trainingId) => {
    navigate(`/attendance/scan?trainingId=${trainingId}&status=Verificado`)
  }, [navigate])

  return (
    <div className="stack">
      <Card>
        <div className="toolbar">
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Mis asistencias</div>
            <div className="muted">Entrenamientos disponibles para registrar asistencia y tu historial.</div>
          </div>
        </div>
      </Card>

      {error ? <Alert type="error">{error}</Alert> : null}
      {geoError ? <Alert type="warning">{geoError}</Alert> : null}

      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : (
          <div className="stack">
            <div className="text-lg font-semibold tracking-tight">Entrenamientos disponibles</div>
            {activeTrainings.length === 0 ? (
              orderedTrainings.length === 0 ? (
                <div className="muted">No hay entrenamientos disponibles</div>
              ) : (
                <div className="muted">No hay entrenamientos activos en este momento</div>
              )
            ) : visibleTrainings.length === 0 ? (
              <div className="muted">No hay entrenamientos dentro de tu rango en este momento</div>
            ) : (
              visibleTrainings.map((training) => {
                const rangeInfo = getTrainingRangeInfo(training)

                return (
                  <div key={training.id_training} className="attendance-card">
                    <div className="attendance-card__header">
                      <div>
                        <div className="attendance-card__title">{training.name}</div>
                        <div className="muted" style={{ marginTop: 6 }}>
                          {toDate(training.date)} · {toTime(training.time)}
                          {training.location ? ` · ${training.location}` : ''}
                        </div>
                      </div>
                      <div className="badge">Entrenamiento</div>
                    </div>

                    <div className="attendance-card__meta">
                      <span className="badge">Deportista</span>
                      <span className="badge">Radio {radioMetros} m</span>
                      <span className={`badge ${rangeInfo.withinWindow ? '' : 'opacity-70'}`}>{rangeInfo.withinWindow ? 'Activo ahora' : 'Fuera de horario'}</span>
                    </div>

                    {rangeInfo.hasCoords && rangeInfo.distance !== null ? (
                      <div className="muted" style={{ marginBottom: 8 }}>
                        Distancia actual: {rangeInfo.distance.toFixed(0)} metros
                      </div>
                    ) : null}

                    {rangeInfo.start && rangeInfo.end ? (
                      <div className="muted" style={{ marginBottom: 8 }}>
                        Ventana: {formatBogotaDateTime(rangeInfo.start, { dateStyle: 'medium', timeStyle: 'short' })} — {formatBogotaDateTime(rangeInfo.end, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ) : null}

                    <div className="toolbar__actions attendance-card__actions">
                      <Button
                        type="button"
                        disabled={!training.id_training || !rangeInfo.withinWindow || !rangeInfo.withinRange}
                        onClick={() => openAttendanceScan(training.id_training)}
                      >
                        Registrar asistencia
                      </Button>
                    </div>
                  </div>
                )
              })
            )}

            {historyRows.length > 0 ? (
              <>
                <div className="text-lg font-semibold tracking-tight" style={{ marginTop: 8 }}>Historial</div>
                <div className="stack">
                  {historyRows.map((row) => (
                    <div key={row.id_attendance} className="attendance-card">
                      <div className="attendance-card__header">
                        <div>
                          <div className="attendance-card__title">{row.training_name || 'Entrenamiento'}</div>
                          <div className="muted" style={{ marginTop: 6 }}>
                            {row.training_date ? String(row.training_date).slice(0, 10) : 'Sin fecha'}
                            {row.training_time ? ` · ${String(row.training_time).slice(0, 5)}` : ''}
                            {row.training_location ? ` · ${row.training_location}` : ''}
                          </div>
                        </div>
                        <div className="badge">{row.status || 'Registrado'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  )
}
