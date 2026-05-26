import { api } from '../services/apiClient'

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

  async submit(formData) {
    const res = await api.post('/media/submit', formData, { formData: true })
    return unwrap(res, 'media')
  },
}
