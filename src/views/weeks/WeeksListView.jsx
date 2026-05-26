import { CrudListView } from '../../components/crud/CrudListView'
import { weekController } from '../../controllers/weekController'

export function WeeksListView() {
  return (
    <CrudListView
      title="Semanas"
      subtitle="Rangos habilitados para subir media."
      load={() => weekController.getAll()}
      createPath="/weeks/new"
      getRowKey={(row) => row.id_week}
      columns={[
        { key: 'id_week', label: 'ID' },
        { key: 'name', label: 'Nombre' },
        { key: 'delivery_date', label: 'Fecha entrega' },
        { key: 'start_time', label: 'Inicio' },
        { key: 'end_time', label: 'Fin' },
      ]}
    />
  )
}
