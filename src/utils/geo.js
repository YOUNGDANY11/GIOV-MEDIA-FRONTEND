const EARTH_RADIUS_METERS = 6371000
const DEFAULT_TIMEOUT_MS = 10000

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