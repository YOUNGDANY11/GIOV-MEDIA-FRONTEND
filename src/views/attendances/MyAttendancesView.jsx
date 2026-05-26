import { CrudListView } from '../../components/crud/CrudListView'
import { attendanceController } from '../../controllers/attendanceController'

export function MyAttendancesView() {
  return (
    <CrudListView
      title="Mis asistencias"
      subtitle="Historial de asistencias del deportista autenticado."
      load={() => attendanceController.getMine()}
      createPath="/my-attendances/new"
      getRowKey={(row) => row.id_attendance}
      columns={[
        { key: 'id_attendance', label: 'ID' },
        { key: 'training_name', label: 'Entrenamiento' },
        { key: 'training_date', label: 'Fecha' },
        { key: 'training_time', label: 'Hora' },
        { key: 'training_location', label: 'Ubicación' },
        { key: 'status', label: 'Estado' },
      ]}
    />
  )
}
