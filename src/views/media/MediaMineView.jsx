import { useState } from 'react'

import { CrudListView } from '../../components/crud/CrudListView'
import { Modal } from '../../components/ui/Modal'
import { mediaController } from '../../controllers/mediaController'

export function MediaMineView() {
  const [selected, setSelected] = useState(null) // { url, name }

  const closeModal = () => setSelected(null)

  return (
    <>
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
          {
            key: 'document',
            label: 'Archivo',
            render: (row) => {
              const url = row?.documentUrl || row?.document
              if (!url) return '—'
              return (
                <button
                  type="button"
                  onClick={() => setSelected({ url, name: row?.name ?? 'Video' })}
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  ▶ Ver video
                </button>
              )
            },
          },
        ]}
      />

      <Modal
        open={Boolean(selected)}
        title={selected?.name ?? 'Video'}
        onClose={closeModal}
      >
        {selected ? (
          <video
            key={selected.url}
            src={selected.url}
            controls
            autoPlay
            className="w-full rounded-xl max-h-[70vh] bg-black"
          >
            Tu navegador no soporta la reproducción de video.
          </video>
        ) : null}
      </Modal>
    </>
  )
}
