import { api } from '../services/apiClient'
import { tokenStorage } from '../services/storage'

const unwrap = (res, key, fallback = null) => (res && typeof res === 'object' ? res[key] ?? fallback : fallback)

export const mediaController = {
  async getAll() {
    const res = await api.get('/media')
    return unwrap(res, 'media', [])
  },

  async getMine() {
    const res = await api.get('/media/mine')
    return unwrap(res, 'media', [])
  },

  async getById(id) {
    const res = await api.get(`/media/${id}`)
    return unwrap(res, 'media')
  },

  async getByWeek(id) {
    const res = await api.get(`/media/week/${id}`)
    return unwrap(res, 'media', [])
  },

  /**
   * Sube un video en dos pasos:
   * 1. Obtiene una URL firmada del backend (sin enviar el archivo)
   * 2. Sube el archivo DIRECTO al bucket desde el navegador
   * 3. Confirma al backend para guardar el registro en BD
   *
   * @param {{ id_week: string, file: File }} params
   * @param {(pct: number) => void}          onProgress  - 0-100
   */
  async submit({ id_week, file }, onProgress) {
    // ── Paso 1: solicitar URL firmada ──────────────────────────────────────
    const presignRes = await api.post('/media/presign', {
      id_week,
      filename:    file.name,
      contentType: file.type || 'video/mp4',
    })

    const { uploadUrl, key, publicUrl } = presignRes
    if (!uploadUrl || !key || !publicUrl) {
      throw new Error('Respuesta inválida del servidor al preparar la subida')
    }

    // ── Paso 2: subida directa al bucket con progreso ──────────────────────
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')

      if (typeof onProgress === 'function') {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        })
      }

      xhr.addEventListener('load', () => {
        // S3 devuelve 200 o 204 en éxito
        if (xhr.status >= 200 && xhr.status < 300) return resolve()
        reject(new Error(`Error al subir el video al bucket (${xhr.status})`))
      })

      xhr.addEventListener('error', () => reject(new Error('Error de red al subir el video')))
      xhr.addEventListener('abort', () => reject(new Error('Subida cancelada')))

      xhr.send(file)
    })

    if (typeof onProgress === 'function') onProgress(100)

    // ── Paso 3: confirmar en el backend y guardar en BD ────────────────────
    const confirmRes = await api.post('/media/confirm', { id_week, key, publicUrl })
    return unwrap(confirmRes, 'media')
  },
}
