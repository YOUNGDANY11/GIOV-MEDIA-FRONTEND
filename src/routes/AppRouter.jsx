import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { RoleRoute } from '../components/layout/RoleRoute'
import { LoginView } from '../views/LoginView'
import { RegisterView } from '../views/RegisterView'
import { DashboardView } from '../views/DashboardView'
import { MeView } from '../views/MeView'
import { UsersListView } from '../views/users/UsersListView'
import { UserFormView } from '../views/users/UserFormView'
import { TrainingsCalendarView } from '../views/trainings/TrainingsCalendarView'
import { TrainingFormView } from '../views/trainings/TrainingFormView'
import { AgendaView } from '../views/agenda/AgendaView'
import { AttendancesAdminView } from '../views/attendances/AttendancesAdminView'
import { AttendancesByTrainingView } from '../views/attendances/AttendancesByTrainingView'
import { AttendanceScanView } from '../views/attendances/AttendanceScanView'
import { MyAttendancesView } from '../views/attendances/MyAttendancesView'
import { MyAttendanceFormView } from '../views/attendances/MyAttendanceFormView'
import { WeeksListView } from '../views/weeks/WeeksListView'
import { WeekFormView } from '../views/weeks/WeekFormView'
import { MediaListView } from '../views/media/MediaListView'
import { MediaMineView } from '../views/media/MediaMineView'
import { MediaSubmitView } from '../views/media/MediaSubmitView'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/register" element={<RegisterView />} />
      <Route path="/attendance/scan" element={<AttendanceScanView />} />

      <Route
        element={(
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/me" element={<MeView />} />

        {/* /trainings accesible a todos — controles internos por rol */}
        <Route path="/trainings" element={<TrainingsCalendarView />} />
        {/* Solo admin puede crear o editar un entrenamiento */}
        <Route path="/trainings/new"       element={<RoleRoute allowedRoles={[1]}><TrainingFormView mode="create" /></RoleRoute>} />
        <Route path="/trainings/:id/edit"  element={<RoleRoute allowedRoles={[1]}><TrainingFormView mode="edit"   /></RoleRoute>} />

        <Route path="/agenda" element={<RoleRoute allowedRoles={[1]}><AgendaView /></RoleRoute>} />

        <Route path="/attendances/list" element={<RoleRoute allowedRoles={[1]}><AttendancesAdminView /></RoleRoute>} />
        <Route path="/attendances/training/:id" element={<RoleRoute allowedRoles={[1]}><AttendancesByTrainingView /></RoleRoute>} />

        <Route path="/users" element={<RoleRoute allowedRoles={[1]}><UsersListView /></RoleRoute>} />
        <Route path="/users/new" element={<RoleRoute allowedRoles={[1]}><UserFormView mode="create" /></RoleRoute>} />
        <Route path="/users/:id/edit" element={<RoleRoute allowedRoles={[1]}><UserFormView mode="edit" /></RoleRoute>} />

        <Route path="/weeks" element={<RoleRoute allowedRoles={[1]}><WeeksListView /></RoleRoute>} />
        <Route path="/weeks/new" element={<RoleRoute allowedRoles={[1]}><WeekFormView /></RoleRoute>} />

        <Route path="/media" element={<RoleRoute allowedRoles={[1]}><MediaListView /></RoleRoute>} />
        <Route path="/media/submit" element={<RoleRoute allowedRoles={[2]}><MediaSubmitView /></RoleRoute>} />
        <Route path="/media/mine" element={<RoleRoute allowedRoles={[2]}><MediaMineView /></RoleRoute>} />

        <Route path="/my-attendances" element={<RoleRoute allowedRoles={[2]}><MyAttendancesView /></RoleRoute>} />
        <Route path="/my-attendances/new" element={<RoleRoute allowedRoles={[2]}><MyAttendanceFormView /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
