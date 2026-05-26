import { tokenStorage } from './storage'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')
export const API_ORIGIN = new URL(API_BASE_URL).origin

export const buildUrl = (path) => {
  const cleanPath = String(path || '').startsWith('/') ? String(path || '') : `/${path}`
  return `${API_BASE_URL}${cleanPath}`
}

export const resolvePublicUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const cleanPath = String(path).replace(/^\/+/, '')
  return `${API_ORIGIN}/${cleanPath}`
}

const readPayload = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text ? { mensaje: text } : null
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, formData = false, signal } = options
  const token = tokenStorage.get()
  const finalHeaders = { ...headers }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  if (!formData && body !== undefined && body !== null && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json'
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: finalHeaders,
    body: body instanceof FormData ? body : body === undefined || body === null ? undefined : (finalHeaders['Content-Type']?.includes('application/json') ? JSON.stringify(body) : body),
    signal,
  })

  const data = await readPayload(response)

  if (!response.ok) {
    const message = data?.mensaje || data?.message || `Error ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
}
