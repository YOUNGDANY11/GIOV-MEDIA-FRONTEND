import { PageHeader } from '../../components/layout/PageHeader'
import { icons } from '../../components/ui/icons'
import { AttendancesCalendarView } from '../attendances/AttendancesCalendarView'

export function AgendaView() {
  return (
    <div className="stack">
      <PageHeader title="Agenda QR" subtitle="Abre un entrenamiento y genera el QR de asistencia." icon={icons.scan} />
      <AttendancesCalendarView hideHeader />
    </div>
  )
}
