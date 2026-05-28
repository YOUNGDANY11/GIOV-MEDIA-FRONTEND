export const BOGOTA_TIME_ZONE = import.meta.env.VITE_ATTENDANCE_TIME_ZONE || 'America/Bogota'

const rawOffsetHours = Number(import.meta.env.VITE_ATTENDANCE_UTC_OFFSET_HOURS || 5)
const BOGOTA_UTC_OFFSET_HOURS = Number.isFinite(rawOffsetHours) ? rawOffsetHours : 5

const normalizeTime = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return null

  const withoutMilliseconds = raw.includes('.') ? raw.split('.')[0] : raw
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(withoutMilliseconds)) return null

  return withoutMilliseconds.length === 5 ? `${withoutMilliseconds}:00` : withoutMilliseconds
}

export const parseBogotaDateTime = (dateValue, timeValue = '00:00:00') => {
  const dateText = dateValue instanceof Date
    ? dateValue.toISOString().slice(0, 10)
    : String(dateValue ?? '').slice(0, 10)
  const timeText = normalizeTime(timeValue)

  if (!dateText || !timeText) return null

  const [year, month, day] = dateText.split('-').map(Number)
  const [hour, minute, second] = timeText.split(':').map(Number)

  if ([year, month, day, hour, minute, second].some(Number.isNaN)) return null

  return new Date(Date.UTC(year, month - 1, day, hour + BOGOTA_UTC_OFFSET_HOURS, minute, second))
}

export const formatBogotaDateTime = (value, options = {}) => {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-CO', {
    timeZone: BOGOTA_TIME_ZONE,
    ...options,
  }).format(date)
}