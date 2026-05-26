import { Link } from 'react-router-dom'

import { CrudListView } from '../../components/crud/CrudListView'
import { trainingController } from '../../controllers/trainingController'

export function TrainingsListView() {
  return (
    <CrudListView
      title="Entrenamientos"
      subtitle="Catálogo de entrenamientos registrados en el backend."
      load={() => trainingController.getAll()}
      createPath="/trainings/new"
      getRowKey={(row) => row.id_training}
      columns={[
        { key: 'id_training', label: 'ID' },
        { key: 'name', label: 'Nombre' },
        { key: 'date', label: 'Fecha' },
        { key: 'time', label: 'Hora' },
        { key: 'location', label: 'Ubicación' },
        { key: 'created_at', label: 'Creado', render: (row) => {
          const value = row?.created_at
          if (!value) return '—'
          const date = new Date(value)
          return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es-CO')
        } },
      ]}
      rowActions={(row) => (
        <div className="toolbar__actions" style={{ justifyContent: 'flex-end' }}>
          <Link className="btn secondary small" to={`/attendances/training/${row.id_training}`}>Asistencias</Link>
          <Link className="btn secondary small" to={`/trainings/${row.id_training}/edit`}>Editar</Link>
        </div>
      )}
    />
  )
}
