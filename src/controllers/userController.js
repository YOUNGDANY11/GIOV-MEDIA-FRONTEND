import { api } from '../services/apiClient'

const unwrap = (res, key, fallback = null) => (res && typeof res === 'object' ? res[key] ?? fallback : fallback)

export const userController = {
  async me() {
    const res = await api.get('/users/me')
    return unwrap(res, 'usuario')
  },

  async getAll() {
    const res = await api.get('/users')
    return unwrap(res, 'usuarios', [])
  },

  async getById(id) {
    const res = await api.get(`/users/${id}`)
    return unwrap(res, 'usuario')
  },

  async findByLastName(lastname) {
    const res = await api.post('/users/lastname', { lastname })
    return unwrap(res, 'usuario', [])
  },

  async create(payload) {
    const res = await api.post('/users', payload)
    return unwrap(res, 'usuario')
  },

  async update(id, payload) {
    const res = await api.put(`/users/${id}`, payload)
    return unwrap(res, 'usuario')
  },

  async remove(id) {
    const res = await api.delete(`/users/${id}`)
    return unwrap(res, 'usuario')
  },
}
