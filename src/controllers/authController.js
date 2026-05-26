import { api } from '../services/apiClient'

export const authController = {
  login(payload) {
    return api.post('/auth/login', payload)
  },

  register(payload) {
    return api.post('/auth/register', payload)
  },
}
