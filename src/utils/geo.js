const EARTH_RADIUS_METERS = 6371000
const DEFAULT_TIMEOUT_MS = 10000

const normalizeCoordinateText = (value) => String(value ?? '').trim().toUpperCase().replace(/[,]+/g, '.')

const parseDecimalCoordinate = (value, kind) => {
  const text = normalizeCoordinateText(value)
  if (!text) return null

  const match = text.match(/^([+-]?\d+(?:\.\d+)?)(?:\s*([NSEW]))?$/)
  if (!match) return null

  let coordinate = Number(match[1])
  if (!Number.isFinite(coordinate)) return null

  const hemisphere = match[2]
  if (hemisphere === 'S' || hemisphere === 'W') coordinate = -Math.abs(coordinate)
  if (hemisphere === 'N' || hemisphere === 'E') coordinate = Math.abs(coordinate)

  if (kind === 'lat' && (coordinate < -90 || coordinate > 90)) return null
  if (kind === 'lng' && (coordinate < -180 || coordinate > 180)) return null

  return coordinate
}

const parseDmsCoordinate = (value, kind) => {
  const text = normalizeCoordinateText(value)
  if (!text) return null

  const hemisphereMatch = text.match(/[NSEW]/)
  const hemisphere = hemisphereMatch?.[0] ?? ''
  const numericText = text.replace(/[NSEW]/g, ' ')
  const parts = numericText.match(/-?\d+(?:\.\d+)?/g) ?? []

  if (parts.length === 0) return null

  const degrees = Number(parts[0])
  const minutes = Number(parts[1] ?? 0)
  const seconds = Number(parts[2] ?? 0)

  if ([degrees, minutes, seconds].some((part) => !Number.isFinite(part))) return null
  if (minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) return null

  let coordinate = Math.abs(degrees) + (minutes / 60) + (seconds / 3600)
  const signedByValue = degrees < 0 ? -1 : 1
  const signedByHemisphere = hemisphere === 'S' || hemisphere === 'W' ? -1 : 1
  coordinate *= signedByValue * signedByHemisphere

  if (kind === 'lat' && (coordinate < -90 || coordinate > 90)) return null
  if (kind === 'lng' && (coordinate < -180 || coordinate > 180)) return null

  return coordinate
}

export function parseCoordinateInput(value, kind) {
  const text = String(value ?? '').trim()
  if (!text) return undefined

  const decimalCoordinate = parseDecimalCoordinate(text, kind)
  if (decimalCoordinate !== null) return decimalCoordinate

  return parseDmsCoordinate(text, kind)
}

export function distanciaMetros(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180

  const deltaLat = toRadians(lat2 - lat1)
  const deltaLon = toRadians(lon2 - lon1)
  const radLat1 = toRadians(lat1)
  const radLat2 = toRadians(lat2)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(a)))
}

export function obtenerPosicion() {
  if (!navigator.geolocation) {
    return Promise.reject(new Error('Este navegador no soporta geolocalización.'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        if (error?.code === error.PERMISSION_DENIED) {
          reject(new Error('No se pudo obtener tu ubicación porque rechazaste el permiso de geolocalización.'))
          return
        }

        if (error?.code === error.POSITION_UNAVAILABLE) {
          reject(new Error('No fue posible determinar tu ubicación. Intenta de nuevo.'))
          return
        }

        if (error?.code === error.TIMEOUT) {
          reject(new Error('La geolocalización tardó demasiado. Intenta nuevamente.'))
          return
        }

        reject(new Error('No se pudo obtener tu ubicación.'))
      },
      {
        enableHighAccuracy: true,
        timeout: DEFAULT_TIMEOUT_MS,
        maximumAge: 0,
      },
    )
  })
}