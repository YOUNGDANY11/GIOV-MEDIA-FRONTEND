import { api } from '../services/apiClient'

export const authController = {
  login(payload) {
    return api.post('/auth/login', payload)
  },

  register(payload) {
    return api.post('/auth/register', payload)
  },

  forgotPassword(document) {
    return api.post('/password-reset/forgot', { document })
  },

  resetPassword(email, code, newPassword) {
    return api.post('/password-reset/reset', { email, code, newPassword })
  },
}
