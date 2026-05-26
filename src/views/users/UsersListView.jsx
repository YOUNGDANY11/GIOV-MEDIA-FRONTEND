import { Link } from 'react-router-dom'

import { CrudListView } from '../../components/crud/CrudListView'
import { userController } from '../../controllers/userController'
import { roleName } from '../../utils/roles'

export function UsersListView() {
  return (
    <CrudListView
      title="Usuarios"
      subtitle="Administración de cuentas del sistema."
      load={() => userController.getAll()}
      createPath="/users/new"
      getRowKey={(row) => row.id_user}
      columns={[
        { key: 'id_user', label: 'ID' },
        { key: 'name', label: 'Nombre' },
        { key: 'lastname', label: 'Apellido' },
        { key: 'document', label: 'Documento' },
        { key: 'email', label: 'Correo' },
        { key: 'id_role', label: 'Rol', render: (row) => roleName(row.id_role) },
      ]}
      rowActions={(row) => (
        <div className="toolbar__actions" style={{ justifyContent: 'flex-end' }}>
          <Link className="btn secondary small" to={`/users/${row.id_user}/edit`}>Editar</Link>
        </div>
      )}
    />
  )
}
