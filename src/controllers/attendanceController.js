import { api } from '../services/apiClient'

const unwrap = (res, key, fallback = null) => (res && typeof res === 'object' ? res[key] ?? fallback : fallback)

export const attendanceController = {
  async getAll() {
    const res = await api.get('/attendances')
    return unwrap(res, 'asistencias', [])
  },

  async getMine() {
    const res = await api.get('/attendances/mine')
    return unwrap(res, 'asistencias', [])
  },

  async getById(id) {
    const res = await api.get(`/attendances/${id}`)
    return unwrap(res, 'asistencia')
  },

  async getByTrainingId(id) {
    const res = await api.get(`/attendances/training/${id}`)
    return unwrap(res, 'asistencias', [])
  },

  async create(payload) {
    const res = await api.post('/attendances', payload)
    return unwrap(res, 'asistencia')
  },
}
