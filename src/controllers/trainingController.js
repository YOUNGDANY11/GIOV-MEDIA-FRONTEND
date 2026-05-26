import { api } from '../services/apiClient'

const unwrap = (res, key, fallback = null) => (res && typeof res === 'object' ? res[key] ?? fallback : fallback)

export const trainingController = {
  async getAll() {
    const res = await api.get('/trainings')
    return unwrap(res, 'entrenamientos', [])
  },

  async getById(id) {
    const res = await api.get(`/trainings/${id}`)
    return unwrap(res, 'entrenamiento')
  },

  async getByLocation(location) {
    const res = await api.get(`/trainings/location?location=${encodeURIComponent(location)}`)
    return unwrap(res, 'entrenamientos', [])
  },

  async create(payload) {
    const res = await api.post('/trainings', payload)
    return unwrap(res, 'entrenamiento')
  },

  async update(id, payload) {
    const res = await api.put(`/trainings/${id}`, payload)
    return unwrap(res, 'entrenamiento')
  },

  async remove(id) {
    const res = await api.delete(`/trainings/${id}`)
    return unwrap(res, 'entrenamiento')
  },
}
