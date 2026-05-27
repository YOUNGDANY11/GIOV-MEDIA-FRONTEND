import { Link } from 'react-router-dom'

import { CrudListView } from '../../components/crud/CrudListView'
import { mediaController } from '../../controllers/mediaController'

const VideoLink = ({ row }) => {
  const url = row?.documentUrl || row?.document
  if (!url) return '—'
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
    >
      ▶ Ver video
    </a>
  )
}

export function MediaListView() {
  return (
    <CrudListView
      title="Media"
      subtitle="Listado general de videos enviados por los usuarios."
      load={() => mediaController.getAll()}
      getRowKey={(row) => row.id_media}
      columns={[
        { key: 'id_media',      label: 'ID' },
        { key: 'user_name',     label: 'Usuario', render: (row) => `${row?.user_name ?? ''} ${row?.user_lastname ?? ''}`.trim() },
        { key: 'week_name',     label: 'Semana' },
        { key: 'delivery_date', label: 'Entrega' },
        { key: 'document',      label: 'Archivo',  render: (row) => <VideoLink row={row} /> },
      ]}
      rowActions={(row) => (
        <div className="toolbar__actions" style={{ justifyContent: 'flex-end' }}>
          <VideoLink row={row} />
        </div>
      )}
    />
  )
}
