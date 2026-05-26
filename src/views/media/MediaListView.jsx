import { Link } from 'react-router-dom'

import { CrudListView } from '../../components/crud/CrudListView'
import { mediaController } from '../../controllers/mediaController'
import { resolvePublicUrl } from '../../services/apiClient'

export function MediaListView() {
  return (
    <CrudListView
      title="Media"
      subtitle="Listado general de videos enviados por los usuarios."
      load={() => mediaController.getAll()}
      getRowKey={(row) => row.id_media}
      columns={[
        { key: 'id_media', label: 'ID' },
        { key: 'user_name', label: 'Usuario', render: (row) => `${row?.user_name ?? ''} ${row?.user_lastname ?? ''}`.trim() },
        { key: 'week_name', label: 'Semana' },
        { key: 'delivery_date', label: 'Entrega' },
        { key: 'document', label: 'Archivo', render: (row) => row?.document ? <a href={resolvePublicUrl(row.document)} target="_blank" rel="noreferrer">Abrir video</a> : '—' },
      ]}
      rowActions={(row) => (
        <div className="toolbar__actions" style={{ justifyContent: 'flex-end' }}>
          {row?.document ? <a className="btn secondary small" href={resolvePublicUrl(row.document)} target="_blank" rel="noreferrer">Ver</a> : null}
        </div>
      )}
    />
  )
}
