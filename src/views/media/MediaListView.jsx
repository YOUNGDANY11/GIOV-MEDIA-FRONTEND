import { useState } from 'react'

import { CrudListView } from '../../components/crud/CrudListView'
import { Modal } from '../../components/ui/Modal'
import { mediaController } from '../../controllers/mediaController'

export function MediaListView() {
  const [selected, setSelected] = useState(null) // { url, name }

  const closeModal = () => setSelected(null)

  return (
    <>
      <CrudListView
        title="Media"
        subtitle="Listado general de videos enviados por los usuarios."
        load={() => mediaController.getAll()}
        getRowKey={(row) => row.id_media}
        columns={[
          { key: 'id_media',      label: 'ID' },
          { key: 'user_name',     label: 'Usuario',  render: (row) => `${row?.user_name ?? ''} ${row?.user_lastname ?? ''}`.trim() },
          { key: 'week_name',     label: 'Semana' },
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
                  onClick={() => setSelected({ url, name: `${row?.user_name ?? ''} ${row?.user_lastname ?? ''} — ${row?.week_name ?? ''}`.trim() })}
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
