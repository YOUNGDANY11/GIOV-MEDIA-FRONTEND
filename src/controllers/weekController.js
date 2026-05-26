import { api } from '../services/apiClient'

const unwrap = (res, key, fallback = null) => (res && typeof res === 'object' ? res[key] ?? fallback : fallback)

export const weekController = {
  async getAll() {
    const res = await api.get('/weeks')
    return unwrap(res, 'weeks', [])
  },

  async getActive() {
    const res = await api.get('/weeks/active')
    return unwrap(res, 'weeks', [])
  },

  async create(payload) {
    const res = await api.post('/weeks', payload)
    return unwrap(res, 'week')
  },

  async remove(id) {
    const res = await api.delete(`/weeks/${id}`)
    return unwrap(res, 'week')
  },
}
