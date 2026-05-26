import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { Card } from '../../components/ui/Card'
import { attendanceController } from '../../controllers/attendanceController'

export function AttendancesListView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true

    const boot = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await attendanceController.getAll()
        if (!alive) return
        setRows(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'No se pudieron cargar las asistencias')
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map()

    for (const row of rows) {
      const key = row?.id_training ?? row?.training_name ?? row?.id_attendance
      const current = map.get(key)

      if (!current) {
        map.set(key, {
          id_training: row?.id_training,
          training_name: row?.training_name || 'Entrenamiento sin nombre',
          training_date: row?.training_date,
          training_time: row?.training_time,
          training_location: row?.training_location,
          count: 1,
          rows: [row],
        })
        continue
      }

      current.count += 1
      current.rows.push(row)
    }

    return [...map.values()].sort((a, b) => {
      const ax = `${String(a?.training_date ?? '').slice(0, 10)}T${String(a?.training_time ?? '00:00:00')}`
      const bx = `${String(b?.training_date ?? '').slice(0, 10)}T${String(b?.training_time ?? '00:00:00')}`
      return bx.localeCompare(ax)
    })
  }, [rows])

  return (
    <div className="stack">
      <Card>
        <div className="toolbar">
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Asistencias</div>
            <div className="muted">Las asistencias del admin se agrupan por entrenamiento.</div>
          </div>
          <div className="toolbar__actions">
            <Link to="/attendances/list" className="btn secondary">Actualizar vista</Link>
          </div>
        </div>
      </Card>

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="muted">Cargando...</div>
        ) : grouped.length === 0 ? (
          <div className="muted">No hay asistencias registradas</div>
        ) : (
          <div className="stack">
            {grouped.map((group) => (
              <div key={group.id_training ?? group.training_name} className="attendance-card">
                <div className="attendance-card__header">
                  <div>
                    <div className="attendance-card__title">{group.training_name}</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {group.training_date ? String(group.training_date).slice(0, 10) : 'Sin fecha'}
                      {group.training_time ? ` · ${String(group.training_time).slice(0, 5)}` : ''}
                      {group.training_location ? ` · ${group.training_location}` : ''}
                    </div>
                  </div>
                  <div className="badge">{group.count} asistencia{group.count === 1 ? '' : 's'}</div>
                </div>

                <div className="attendance-card__meta">
                  <span className="badge">Entrenamiento</span>
                  <span className="badge">Admin</span>
                </div>

                <div className="toolbar__actions attendance-card__actions">
                  <Link className="btn secondary" to={`/attendances/training/${group.id_training}`}>
                    Ver por entrenamiento
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
