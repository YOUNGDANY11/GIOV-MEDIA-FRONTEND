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

export function MediaMineView() {
  return (
    <CrudListView
      title="Mis videos"
      subtitle="Videos enviados por el deportista autenticado."
      load={() => mediaController.getMine()}
      createPath="/media/submit"
      getRowKey={(row) => row.id_media}
      columns={[
        { key: 'id_media',      label: 'ID' },
        { key: 'name',          label: 'Semana' },
        { key: 'delivery_date', label: 'Entrega' },
        { key: 'document',      label: 'Archivo', render: (row) => <VideoLink row={row} /> },
      ]}
    />
  )
}
