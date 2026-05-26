import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { attendanceController } from '../../controllers/attendanceController'
import { trainingController } from '../../controllers/trainingController'
import { icons } from '../../components/ui/icons'

export function AttendancesByTrainingView() {
  const navigate = useNavigate()
  const { id } = useParams()
  const trainingId = useMemo(() => Number(id || 0), [id])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [training, setTraining] = useState(null)

  useEffect(() => {
    let alive = true

    const boot = async () => {
      setLoading(true)
      setError('')

      try {
        if (!trainingId) {
          setError('ID de entrenamiento inválido.')
          return
        }

        const [attendances, trainingRow] = await Promise.all([
          attendanceController.getByTrainingId(trainingId).catch(() => []),
          trainingController.getById(trainingId).catch(() => null),
        ])

        if (!alive) return
        setRows(Array.isArray(attendances) ? attendances : [])
        setTraining(trainingRow)
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'No se pudo cargar el entrenamiento')
      } finally {
        if (alive) setLoading(false)
      }
    }

    boot()
    return () => {
      alive = false
    }
  }, [trainingId])

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-extrabold">Asistencias por entrenamiento</div>
            <div className="text-neutral-300">{training?.name || `Entrenamiento #${trainingId}`}</div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/attendances/list" className="inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5">Ver listado general</Link>
            <Button variant="secondary" icon={icons.back} onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </div>
      </Card>

      {error ? <Alert type="error">{error}</Alert> : null}

      <Card>
        {loading ? (
          <div className="text-neutral-400">Cargando...</div>
        ) : (
          <DataTable
            rows={rows}
            getRowKey={(row) => row.id_attendance}
            emptyText="No hay asistencias registradas para este entrenamiento"
            columns={[
              { key: 'id_attendance', label: 'ID' },
              { key: 'athlete', label: 'Deportista', render: (row) => `${row?.athlete_name ?? ''} ${row?.athlete_lastname ?? ''}`.trim() },
              { key: 'status', label: 'Estado' },
              { key: 'created_at', label: 'Registrado', render: (row) => {
                const value = row?.created_at
                if (!value) return '—'
                const date = new Date(value)
                return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es-CO')
              } },
            ]}
          />
        )}
      </Card>
    </div>
  )
}
