import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url'

QrScanner.WORKER_PATH = QrScannerWorkerPath

export function QrCameraScanner({ onDecode, onError }) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('starting')

  useEffect(() => {
    if (!videoRef.current) return undefined

    let scanner = null
    let cancelled = false

    scanner = new QrScanner(
      videoRef.current,
      (result) => onDecode?.(result?.data ?? result),
      {
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      },
    )

    scanner.start()
      .then(() => { if (!cancelled) setStatus('ready') })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        onError?.(err?.message || 'No se pudo acceder a la cámara. Verifica los permisos del navegador.')
      })

    return () => {
      cancelled = true
      scanner?.stop()
      scanner?.destroy()
    }
  }, [onDecode, onError])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black aspect-square max-w-sm mx-auto">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />

      {status !== 'ready' ? (
        <div className="absolute inset-0 grid place-items-center bg-black/70 px-4 text-center text-sm text-neutral-300">
          {status === 'error' ? 'No se pudo activar la cámara.' : 'Activando cámara...'}
        </div>
      ) : null}
    </div>
  )
}
