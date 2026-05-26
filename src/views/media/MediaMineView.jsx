import { CrudListView } from '../../components/crud/CrudListView'
import { mediaController } from '../../controllers/mediaController'
import { resolvePublicUrl } from '../../services/apiClient'

export function MediaMineView() {
  return (
    <CrudListView
      title="Mis videos"
      subtitle="Videos enviados por el deportista autenticado."
      load={() => mediaController.getMine()}
      createPath="/media/submit"
      getRowKey={(row) => row.id_media}
      columns={[
        { key: 'id_media', label: 'ID' },
        { key: 'name', label: 'Semana' },
        { key: 'delivery_date', label: 'Entrega' },
        { key: 'document', label: 'Archivo', render: (row) => row?.document ? <a href={resolvePublicUrl(row.document)} target="_blank" rel="noreferrer">Abrir video</a> : '—' },
      ]}
    />
  )
}
